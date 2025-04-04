import { isEqual } from 'lodash-es'
import type { AIService, AIServiceAPIOptionsForChat, IMessage } from 'spirit'
import { MessagePlugin } from 'tdesign-react'

import { editMessage, sendMessage } from '../atoms/chatroom'
import { getDefaultAIService, getOrCreateInstanceAndAPI } from '../configurers/AIService/base'
import { ee } from '../instances/ee'
import { electronStore, keyAtom } from '../store'
import { tools } from '../tools'

const runTool = async (name: string, parameters: unknown): Promise<string> => {
  if (!tools[name]) {
    throw new Error(`Tool "${name}" not found`)
  }
  return tools[name].call(parameters)
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

  const { uuid } = sendTo('Thinking', bot)
  let count = 0
  const t = setInterval(() => {
    editTo(0, 'Thinking' + '.'.repeat(count))
    count = (count + 1) % 4
  }, 300)

  try {
    const resolvedMessages: IMessage[] = messages
      ?.toReversed()
      ?.map(m => ({
        ...m,
        text: m.text && m.user?.name === bot.name
          ? m.text
            .replace(/^\n*<think[^>]*>[\s\S]*?<\/think>\n*/, '')
            .replace(/^\n*<\/think>\n*/, '')
          : m.text
      } as IMessage))
      ?? []
    const allMessages: IMessage[] = [
      {
        uuid: 'system',
        type: 'system',
        text: `Your name is "${bot.name}"${bot.description ? ` and your description is "${bot.description}"` : ''}.`,
        ctime: Date.now(),
        assets: []
      },
      ...resolvedMessages
    ]
    for await (
      const [message, { toolCalls, status }] of api.chat(
        instance,
        bot,
        allMessages,
        aiService.option,
        Object.assign(
          {},
          {
            tools: Object.values(tools).map(({ call: _, ...t }) => t)
          },
          options as AIServiceAPIOptionsForChat[typeof aiService.option['type']]
        )
      )
    ) {
      if (status === 'started') clearInterval(t)
      editTo(uuid, message)
      if (status === 'completed') {
        if (toolCalls?.length && toolCalls.length > 0) {
          editTo(uuid, message, { toolCalls })
          for (const { function: { name = undefined, arguments: parameters = {} } = {} } of toolCalls) {
            if (!name) continue

            sendTo(await runTool(name, parameters), m.user!, { type: 'tool' })
          }
        }
      }
    }
  } catch (e) {
    clearInterval(t)
    // @ts-ignore
    editTo(uuid, 'message' in e ? e.message : e.toString())
    console.error(e)
  }
})
