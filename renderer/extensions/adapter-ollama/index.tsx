import { Ollama } from 'ollama/browser'
import type { IToolCall } from 'spirit'

import ollamaIcon from '../../assets/ollama.svg'
import { defineAIServiceAdapter } from '../../extension'
import { OptionConfigurer } from './OptionConfigurer'

export default defineAIServiceAdapter('ollama', {
  creator: options =>
    new Ollama({
      host: options.apiHost
    }),
  api: {
    chat: async function*(
      instance,
      bot,
      messages,
      adapterOptions,
      options
    ) {
      const model = options?.model ?? adapterOptions?.defaultModel ?? 'llama2-chinese:13b'
      if (!model) throw new Error('Model not configured')

      const completions = await instance.chat({
        model,
        messages: messages.map(m => ({
          role: m.type === undefined
            ? m.user?.name === bot.name ? 'assistant' : 'user'
            : m.type,
          content: m.text ?? '',
          images: m.assets?.map(({ url }) => url) ?? []
        })),
        tools: options?.tools,
        stream: true
      })
      let streamMessage = ''
      const toolCalls: IToolCall[] = []
      yield [streamMessage, { status: 'started' }]
      for await (const { message } of completions) {
        streamMessage += message.content ?? ''
        if (message.tool_calls) {
          toolCalls.push(
            ...message.tool_calls.map((rest, index) => ({ id: `${index}`, ...rest }))
          )
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
      const { models } = await instance.list()
      return models.map(({
        name,
        details: { parent_model: parentModel, families },
        modified_at: ctime
      }) => ({
        id: name,
        label: [name, parentModel, families?.join(', ')].filter(Boolean).join('/'),
        ctime
      }))
    }
  },
  type: {
    label: 'Ollama',
    image: ollamaIcon
  },
  Writer: OptionConfigurer
})
