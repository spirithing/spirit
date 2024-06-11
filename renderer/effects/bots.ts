import { isEqual } from 'lodash-es'
import ollama from 'ollama'
import type OpenAI from 'openai'
import type { Bot, IMessage } from 'spirit'
import { MessagePlugin } from 'tdesign-react'

import { editMessage, sendMessage } from '../atoms/chatroom'
import { openAIAtom } from '../atoms/openAI'
import { ee } from '../instances/ee'
import { electronStore, getThrowWhenUndefined, keyAtom } from '../store'

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

interface Adapter {
  chat(bot: Bot, messages: IMessage[], options?: {
    model?: string
  }): AsyncIterable<[string, {
    status: 'started' | 'running' | 'completed'
  }]>
}

const openaiAdapter: Adapter = {
  chat: async function*(bot, messages, options) {
    const openai = getThrowWhenUndefined(openAIAtom)
    const openaiConfig = getThrowWhenUndefined('openaiConfig')

    const model = openaiConfig.defaultModel ?? options?.model
    if (!model) throw new Error('Model not configured')

    const completions = await openai.chat.completions.create({
      ...options,
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
  }
}

const ollamaAdapter: Adapter = {
  chat: async function*(bot, messages, options) {
    const completions = await ollama.chat({
      model: 'llama2-chinese:13b',
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
  }
}

ee.on('addMessage', async (m, { id, messages, options }) => {
  const botAtom = keyAtom('bot')
  if (!botAtom) return
  const bot = electronStore.get(botAtom)
  if (!bot) {
    // TODO check name and description is empty, and prompt user to configure it
    MessagePlugin.error('Bot not Configured')
    return
  }
  if (isEqual(m.user, bot)) return

  const openai = electronStore.get(openAIAtom)
  if (!openai) {
    // TODO prompt user to configure it
    MessagePlugin.error('OpenAI not initialized')
    return
  }

  const openaiConfigAtom = keyAtom('openaiConfig')
  if (!openaiConfigAtom) return
  const openaiConfig = electronStore.get(openaiConfigAtom)
  if (!openaiConfig) return
  const model = openaiConfig.defaultModel ?? options?.model
  if (!model) {
    // TODO prompt user to configure it
    MessagePlugin.error('Model not configured')
    return
  }

  const sendTo = sendMessage.bind(null, id)
  const editTo = editMessage.bind(null, id)
  if (import.meta.env.DEV && m.text === 'd') {
    setTimeout(() => sendTo('pong', bot), 500)
    return
  }

  const { uuid } = sendTo('Inputting', bot)
  let count = 0
  const t = setInterval(() => {
    editTo(0, 'Inputting' + '.'.repeat(count))
    count = (count + 1) % 4
  }, 300)
  try {
    for await (
      const [message, { status }] of openaiAdapter.chat(bot, messages ?? [], { model: options?.model })
    ) {
      if (status === 'started') clearInterval(t)
      editTo(uuid, message)
    }
  } catch (e) {
    // @ts-ignore
    editTo(uuid, 'message' in e ? e.message : e.toString())
  }
})
