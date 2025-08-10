import i18n from 'i18next'
import { defaultsDeep, isEqual, template } from 'lodash-es'
import type { IMessage } from 'spirit'
import { MessagePlugin } from 'tdesign-react'

import { editMessage, sendMessage } from '#renderer/atoms/chatroom.ts'
import { getOrCreateInstanceAndAPI, getTargetOrDefaultAIService } from '#renderer/configurers/AIService/base.tsx'
import { ee } from '#renderer/instances/ee.ts'
import { getThrowWhenUndefined } from '#renderer/store.ts'
import { tools } from '#renderer/tools/index.ts'
import { JSON_MD_WRAPPER, MD_CODE_BLOCK } from '#sharing/constants.ts'
import { creatCaught } from '#sharing/utils/creatCaught.ts'

const DEFAULT_SYSTEM_PROMPT_TEMPLATE = `
Your name is "<%= bot.name %>", "<%= bot.description %>".
You chat with "<%= user.name %>" in "<%= chatroom.name %>", and the chatroom description is "<%= chatroom.description %>".
Now is "<%= system.now %>".
`.trim()

const runTool = async (name: string, parameters: unknown): Promise<string> => {
  if (!tools[name]) {
    throw new Error(`Tool "${name}" not found`)
  }
  return tools[name].call(parameters)
}

export function getTargetOrDefaultBot(uuid?: string) {
  return uuid
    ? getThrowWhenUndefined('bots')?.[uuid]
    : getThrowWhenUndefined('bot')
}

ee.on('addMessage', async (m, chatroom) => {
  const { id, messages } = chatroom
  if (m.type?.startsWith('__spirit:')) return

  const sendTo = sendMessage.bind(null, id)
  const editTo = editMessage.bind(null, id)

  const alert = (type: 'info' | 'warn' | 'error', text: string) => {
    sendTo(text, { name: `system:alert[${type}]` }, { type: '__spirit:system__' })
  }

  if (import.meta.env.DEV && m.text === 'ping') {
    alert('info', 'pong')
    return
  }

  try {
    if (import.meta.env.DEV && m.text === 'throw') {
      throw new Error('Test error')
    }
    const caught = creatCaught()
    const bot = getTargetOrDefaultBot(chatroom.options?.bot?.uuid)

    if (isEqual(m.user, bot)) return

    const { uuid } = sendTo('Thinking', bot)
    let count = 0
    const t = setInterval(() => {
      editTo(0, 'Thinking' + '.'.repeat(count))
      count = (count + 1) % 4
    }, 300)
    using _ = caught.only({ [Symbol.dispose]: () => clearInterval(t) })

    if (import.meta.env.DEV && m.text === 'ping:bot') {
      await new Promise(ok => setTimeout(ok, 1000))
      const prefix = `pong:bot \`${bot.name}\`[${bot.uuid}]`
      const options = `# Options\n${JSON_MD_WRAPPER(JSON.stringify(bot.options, null, 2))}`
      const description = `# Description\n${MD_CODE_BLOCK('md', bot.description ?? '')}`
      editTo(uuid, [prefix, options, description].join('\n'))
      return
    }

    const aiService = getTargetOrDefaultAIService(
      chatroom.options?.aiService?.uuid ?? bot.options?.aiService?.uuid
    )
    if (import.meta.env.DEV && m.text === 'ping:service') {
      const prefix = `pong:service \`${aiService.name}\`[${aiService.uuid}]`
      editTo(uuid, `${prefix}\n${JSON_MD_WRAPPER(JSON.stringify(aiService?.options, null, 2))}`)
      return
    }
    const [instance, api] = getOrCreateInstanceAndAPI(aiService.options)
    const chat = api.chat.bind(null, instance, bot)

    const adapterOptions = defaultsDeep(
      chatroom.options?.aiService?.options,
      bot.options?.aiService?.options,
      aiService.options
    )
    if (import.meta.env.DEV && m.text === 'ping:adapter') {
      editTo(uuid, `${JSON_MD_WRAPPER(JSON.stringify(adapterOptions, null, 2))}`)
      return
    }

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
      ?.filter(m => m.type !== '__spirit:system__')
      ?? []
    const now = new Date()
    const systemPrompt = template(
      chatroom.options?.overrideSystemPrompt ?? DEFAULT_SYSTEM_PROMPT_TEMPLATE
    )({
      bot: {
        name: bot.name,
        description: bot.description
      },
      user: {
        name: m.user?.name
      },
      chatroom: {
        name: chatroom.name,
        description: chatroom.description
      },
      system: {
        now: now.toLocaleString(),
        time: now.toLocaleTimeString(),
        date: now.toLocaleDateString(),
        lang: i18n.language
      }
    })
    if (m.text === 'REPEAT YOUR SYSTEM PROMPT!!!') {
      editTo(uuid, systemPrompt)
      return
    }
    const allMessages: IMessage[] = [
      {
        uuid: 'system',
        type: 'system',
        text: systemPrompt,
        ctime: now,
        assets: []
      },
      {
        uuid: '__spirit:system_0__',
        type: 'user',
        text: 'Okay?',
        ctime: now,
        user: m.user,
        assets: []
      },
      {
        uuid: '__spirit:system_1__',
        type: 'assistant',
        text: chatroom.options?.firstBotMessage ?? 'Yes.',
        ctime: now,
        user: bot,
        assets: []
      },
      ...resolvedMessages
    ]

    const resolvedTools = (
        chatroom.options?.enableTools ?? bot.options?.enableTools
      )
      ? Object.values(tools).map(({ call: _, ...t }) => t)
      : []
    const filteredTools = resolvedTools

    for await (
      const [message, { toolCalls, status }] of chat(
        allMessages,
        adapterOptions,
        { tools: filteredTools }
      )
    ) {
      if (status === 'started') clearInterval(t)
      editTo(uuid, message)
      if (status === 'completed') {
        if (toolCalls?.length && toolCalls.length > 0) {
          editTo(uuid, message, { toolCalls })
          for (
            const {
              id,
              function: { name = undefined, arguments: parameters = {} } = {}
            } of toolCalls
          ) {
            if (!name) continue

            sendTo(
              await runTool(name, parameters),
              m.user!,
              { type: 'tool', toolCallId: id }
            )
          }
        }
      }
    }
    caught.not()
  } catch (e) {
    const errMsg = e instanceof Error
      ? import.meta.env.DEV
        ? e.stack ?? ''
        : `${e.name}: ${e.message}`
      : String(e)
    alert('error', errMsg)
    // sendTo(e instanceof Error ? e.message : String(e))
    if (e instanceof Error) {
      void MessagePlugin.error(e.message)
    } else {
      void MessagePlugin.error(String(e))
    }
    console.error(e)
  }
})
