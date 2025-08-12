import OpenAI from 'openai'
import type { Bot, IMessage, IToolCall } from 'spirit'

import chatgptIcon from '#renderer/assets/chatgpt.svg'
import { defineAIServiceAdapter } from '#renderer/extension.ts'

import { ChatConfigurer } from './configurers/ChatConfigurer'
import { OptionsConfigurer } from './configurers/OptionsConfigurer'

function messageTransform(bot: Bot, m: IMessage): OpenAI.ChatCompletionMessageParam {
  const isBot = m.user?.name === bot.name
  const name = m.user?.name ?? 'unknown'
  if (isBot) {
    return {
      name,
      role: 'assistant',
      content: m.text,
      // eslint-disable-next-line camelcase
      tool_calls: m.toolCalls?.map(c => ({
        ...c,
        id: c.id ?? 'unknown',
        function: {
          ...c.function,
          // eslint-disable-next-line camelcase
          arguments: JSON.stringify(c.function?.arguments ?? {})
        }
      } as OpenAI.ChatCompletionMessageToolCall))
    }
  }
  if (m.type) {
    switch (m.type) {
      case 'system':
      case 'developer':
        return {
          name: m.type,
          role: m.type as 'system' | 'developer',
          content: m.text ?? ''
        }
      case 'tool':
        return {
          // TODO: tool_call_id
          // eslint-disable-next-line camelcase
          tool_call_id: m.toolCallId!,
          role: 'tool',
          content: m.text ?? ''
        }
    }
  }
  return {
    name,
    role: 'user',
    content: (m.assets && m.assets.length > 0)
      ? [
        {
          type: 'text',
          text: m.text ?? ''
        },
        ...m.assets?.map(({ type, url }) => ({
          type: {
            image: 'image_url' as const
          }[type],
          // eslint-disable-next-line camelcase
          image_url: { url }
        })) ?? []
      ]
      : m.text ?? ''
  }
}

export default defineAIServiceAdapter('openai', {
  creator: options => {
    return new OpenAI({
      dangerouslyAllowBrowser: true,
      baseURL: options.apiHost,
      apiKey: options.apiKey ?? ''
    })
  },
  api: {
    chat: async function*(
      instance,
      bot,
      messages,
      adapterOptions,
      options
    ) {
      const model = adapterOptions?.chat?.model ?? adapterOptions?.defaultModel ?? 'gpt-3.5-turbo'
      if (!model) throw new Error('Model not configured')

      const completions = await instance.chat.completions.create({
        model,
        // eslint-disable-next-line camelcase
        max_tokens: 4096,
        messages: messages?.map(messageTransform.bind(null, bot)) ?? [],
        stream: true,
        tools: options?.tools?.map((tool) => ({
          ...tool
        } as OpenAI.ChatCompletionTool))
      })
      let streamMessage = ''
      const toolCalls: OpenAI.ChatCompletionChunk.Choice.Delta.ToolCall[] = []
      yield [streamMessage, { status: 'started' }] as const
      for await (const { choices: [{ delta }] } of completions) {
        streamMessage += delta.content ?? ''
        const { tool_calls: deltaToolCalls } = delta
        if (deltaToolCalls) {
          deltaToolCalls.forEach((toolCall, index) => {
            if (toolCalls[index] === undefined) {
              toolCalls[index] = toolCall
            } else {
              const func = toolCalls[index].function
              if (
                func?.arguments !== undefined
                && toolCall.function?.arguments !== undefined
              ) {
                func.arguments += toolCall.function?.arguments
              }
            }
          })
        }
        yield [streamMessage, {
          toolCalls: [],
          status: 'running'
        }] as const
      }
      const resolveToolCalls = toolCalls.map(rest => ({
        ...rest,
        function: {
          ...rest.function,
          arguments: rest.function?.arguments
            ? JSON.parse(rest.function.arguments)
            : {}
        }
      } as IToolCall))
      yield [streamMessage, {
        toolCalls: resolveToolCalls,
        status: 'completed'
      }]
    },
    models: async instance => {
      const { data } = await instance.models.list()
      return data.map(({ id }) => ({
        id,
        label: id
          .replaceAll('gpt-', 'GPT-')
          .replace(/^([a-z])/, (_, c) => c.toUpperCase())
          .replace(/-([a-z])/g, (_, c) => ` ${c.toUpperCase()}`)
          .replaceAll('-', ' ')
      }))
    }
  },
  type: {
    label: 'OpenAI',
    image: chatgptIcon
  },
  Writer: OptionsConfigurer,
  ChatOptionsWriter: ChatConfigurer
})
