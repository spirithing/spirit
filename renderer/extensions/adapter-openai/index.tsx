import OpenAI from 'openai'
import type { Bot, IMessage } from 'spirit'

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
  return {
    name,
    role: 'user',
    content: m.assets
      ? [
        {
          type: 'text',
          text: isBot ? '' : `${m.user?.name}:\n${m.text}`
        },
        ...m.assets?.map(({ type, url }) => ({
          type: {
            image: 'image_url' as const
          }[type],
          // eslint-disable-next-line camelcase
          image_url: { url }
        })) ?? []
      ]
      : m.text
  }
}

export default defineAIServiceAdapter('openai', {
  creator: options => {
    return new OpenAI({
      dangerouslyAllowBrowser: true,
      baseURL: options.apiHost,
      apiKey: options.apiKey
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
      const model = options?.model ?? adapterOptions?.defaultModel ?? 'gpt-3.5-turbo'
      if (!model) throw new Error('Model not configured')

      const completions = await instance.chat.completions.create({
        model,
        // eslint-disable-next-line camelcase
        max_tokens: 4096,
        messages: [
          {
            content: `Your name is "${bot.name}" and your description is "${bot.description}".`,
            role: 'system'
          },
          ...messages?.map(messageTransform.bind(null, bot)).reverse() ?? []
        ],
        stream: true
      })
      let streamMessage = ''
      yield [streamMessage, { status: 'started' }]
      for await (const { choices: [{ delta }] } of completions) {
        streamMessage += delta.content ?? ''
        yield [streamMessage, {
          ...delta,
          status: 'running'
        }]
      }
      yield [streamMessage, { status: 'completed' }]
    },
    models: async instance => {
      const { data, hasNextPage: _hasNextPage, getNextPage } = await instance.models.list()
      let hasNextPage = _hasNextPage()
      while (hasNextPage) {
        const { data: nextData, hasNextPage: _hasNextPage } = await getNextPage()
        hasNextPage = _hasNextPage()
        data.push(...nextData)
      }
      return data.map(({ id }) => ({
        id,
        label: id
          .replace(/^([a-z])/, (_, c) => c.toUpperCase())
          .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
          .replace('-', ' ')
      }))
    }
  },
  type: {
    label: 'OpenAI',
    image: chatgptIcon
  },
  Writer: OptionConfigurer
})
