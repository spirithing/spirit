import { isEqual } from 'lodash-es'
import type OpenAI from 'openai'
import type { Bot, IMessage } from 'spirit'
import { MessagePlugin } from 'tdesign-react'

import { editMessage, sendMessage } from '../atoms/chatroom'
import { openAIAtom } from '../atoms/openAI'
import { ee } from '../instances/ee'
import { electronStore, keyAtom } from '../store'

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

  const messageTransformWithBot = messageTransform.bind(null, bot)
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
  const completions = await openai.chat.completions.create({
    model,
    // eslint-disable-next-line camelcase
    max_tokens: 4096,
    messages: [
      {
        content: `Your name is "${bot.name}" and your description is "${bot.description}".`,
        role: 'system'
      },
      ...messages?.map(messageTransformWithBot).reverse() ?? []
    ],
    stream: true
  }).finally(() => clearInterval(t))
  editTo(uuid, '')
  let streamMessage = ''
  for await (const { choices: [{ delta }] } of completions) {
    streamMessage += delta.content ?? ''
    editTo(0, streamMessage)
  }
})
