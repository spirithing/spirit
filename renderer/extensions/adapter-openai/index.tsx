import OpenAI from 'openai'
import type { Bot, IMessage, IToolCall } from 'spirit'

import chatgptIcon from '../../assets/chatgpt.svg'
import { defineAIServiceAdapter } from '../../extension'
import { OptionConfigurer } from './OptionConfigurer'

function messageTransform(bot: Bot, m: IMessage): OpenAI.ChatCompletionMessageParam {
  const isBot = m.user?.name === bot.name
  const name = m.user?.name ?? 'unknown'
  if (isBot) {
    return {
      name,
      role: 'assistant',
      content: m.text
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
          tool_call_id: '',
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
      const toolCalls: IToolCall[] = []
      yield [streamMessage, { status: 'started' }]
      for await (const { choices: [{ delta }] } of completions) {
        streamMessage += delta.content ?? ''
        if (delta.tool_calls) {
          toolCalls.push(...delta.tool_calls.map(rest => ({
            ...rest,
            function: {
              name: rest.function?.name ?? undefined,
              arguments: rest.function?.arguments
                ? JSON.parse(rest.function.arguments)
                : undefined
            }
          })))
        }
        yield [streamMessage, {
          toolCalls,
          status: 'running'
        }]
      }
      yield [streamMessage, {
        toolCalls,
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
  Writer: OptionConfigurer
})
