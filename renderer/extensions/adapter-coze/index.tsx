import cozeIcon from '../../assets/coze.svg'
import { defineAIServiceAdapter } from '../../extension'
import { OptionConfigurer } from './OptionConfigurer'
import type { CozeQuesterMessage } from './Quester'
import CozeQuester from './Quester'

export default defineAIServiceAdapter('coze', {
  creator: options =>
    new CozeQuester({
      apiHost: options.apiHost ?? 'https://api.coze.cn/open_api/v2',
      bearerToken: options.bearerToken
    }),
  api: {
    chat: async function*(
      instance,
      bot,
      messages,
      adapterOptions,
      options
    ) {
      const botID = options?.botID ?? adapterOptions?.defaultBotID
      if (!botID) throw new Error('Bot ID is not Configured')

      const [question, ...old] = messages
      const completions = await instance.chat({
        botID,
        // TODO
        user: 'unknown',
        stream: true,
        query: question.text ?? '',
        chatHistory: old.map(m => {
          const role = m.user?.name === bot.name ? 'assistant' : 'user'
          const common = {
            role,
            content: m.text ?? '',
            contentType: 'text'
          }
          if (role === 'user') {
            return common as CozeQuesterMessage
          }
          if (role === 'assistant') {
            return {
              ...common,
              type: 'answer'
            } as CozeQuesterMessage
          }
          return
        }).filter(<T,>(v: T | undefined): v is T => Boolean(v))
      })
      let streamMessage = ''
      yield [streamMessage, { status: 'started' }]
      for await (const item of completions) {
        if (item.event === 'message' && item.message.type === 'answer') {
          streamMessage += item.message.content ?? ''
          yield [streamMessage, { status: 'running' }]
        }
        if (item.event === 'error') {
          streamMessage = item.errorInformation.msg
          break
        }
      }
      yield [streamMessage, { status: 'completed' }]
    },
    models: async () => {
      return []
    }
  },
  type: {
    label: 'coze',
    image: cozeIcon
  },
  Writer: OptionConfigurer
})
