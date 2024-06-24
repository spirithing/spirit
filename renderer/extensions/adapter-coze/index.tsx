import cozeIcon from '../../assets/coze.svg'
import { defineAIServiceAdapter } from '../../extension'
import { OptionConfigurer } from './OptionConfigurer'

export default defineAIServiceAdapter('coze', {
  creator: options => ({}),
  api: {
    chat: async function*(
      instance,
      bot,
      messages,
      adapterOptions,
      options
    ) {
      const model = options?.model ?? adapterOptions?.defaultModel
      if (!model) throw new Error('Model not configured')

      const completions = await instance.chat({
        model,
        messages: messages.map(m => ({
          role: m.user?.name === bot.name ? 'assistant' : 'user',
          content: m.text ?? '',
          images: m.assets?.map(({ url }) => url) ?? []
        })),
        stream: true
      })
      let streamMessage = ''
      yield [streamMessage, { status: 'started' }]
      for await (const { message } of completions) {
        streamMessage += message.content ?? ''
        yield [streamMessage, { status: 'running' }]
      }
      yield [streamMessage, { status: 'completed' }]
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
    label: 'coze',
    image: cozeIcon
  },
  Writer: OptionConfigurer
})
