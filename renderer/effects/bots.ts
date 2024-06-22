import { isEqual } from 'lodash-es'
import type { AIService, AIServiceAPIOptionsForChat } from 'spirit'
import { MessagePlugin } from 'tdesign-react'

import { editMessage, sendMessage } from '../atoms/chatroom'
import { getDefaultAIService, getOrCreateInstanceAndAPI } from '../configurers/AIService/base'
import { ee } from '../instances/ee'
import { electronStore, keyAtom } from '../store'

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

  const sendTo = sendMessage.bind(null, id)
  const editTo = editMessage.bind(null, id)

  let aiService: AIService | undefined
  try {
    aiService = getDefaultAIService(options?.aiServiceUUID)
    if (!aiService) {
      throw new Error('AI Service not found')
    }
  } catch (e) {
    // @ts-ignore
    MessagePlugin.error(e.message ?? String(e))
    return
  }
  const [instance, api] = getOrCreateInstanceAndAPI(aiService.option)

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
      const [message, { status }] of api.chat(
        instance,
        bot,
        messages ?? [],
        aiService.option,
        options as AIServiceAPIOptionsForChat[typeof aiService.option['type']]
      )
    ) {
      if (status === 'started') clearInterval(t)
      editTo(uuid, message)
    }
  } catch (e) {
    clearInterval(t)
    // @ts-ignore
    editTo(uuid, 'message' in e ? e.message : e.toString())
    console.error(e)
  }
})
