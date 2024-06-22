import { isEqual } from 'lodash-es'
import { AIService, AIServiceAPIOptionsForChat, AIServiceOptions } from 'spirit'
import { MessagePlugin } from 'tdesign-react'

import { editMessage, sendMessage } from '../atoms/chatroom'
import { apis, creators } from '../configurers/AIService/base'
import type { AIServiceAdapter } from '../extension'
import { ee } from '../instances/ee'
import { electronStore, getThrowWhenUndefined, keyAtom } from '../store'

function getDefaultAIService() {
  const aiServiceDefaultUUID = getThrowWhenUndefined('defaultAIServiceUUID')
  const aiServices = getThrowWhenUndefined('aiServices')
  return aiServices.find(s => s.uuid === aiServiceDefaultUUID)
}
const instances = new WeakMap<
  AIService['option'],
  ReturnType<
    AIServiceAdapter<keyof AIServiceOptions>['creator']
  >
>()
function getOrCreateInstance(aiService: AIService): ReturnType<
  AIServiceAdapter<AIService['option']['type']>['creator']
> {
  const { option } = aiService
  const instance = instances.get(option)
  if (instance) {
    // @ts-ignore
    return instance
  }
  const creator = creators[option.type]
  if (!creator) throw new Error('Creator not found, please check your configuration')
  const adapter = creator(option as any)
  instances.set(option, adapter)
  return adapter
}
function getOrCreateInstanceAndAPI<
  K extends keyof AIServiceOptions,
  A extends AIServiceAdapter<K>,
>(
  aiService: AIService
): [ReturnType<A['creator']>, A['api']] {
  const instance = getOrCreateInstance(aiService)
  const api = apis[aiService.option.type]
  if (!api) throw new Error('API not found, please check your configuration')
  return [
    instance as ReturnType<A['creator']>,
    api as A['api']
  ]
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

  let aiService: AIService | undefined
  try {
    aiService = getDefaultAIService()
    if (!aiService) {
      throw new Error('AI Service not found')
    }
  } catch (e) {
    // @ts-ignore
    MessagePlugin.error(e.message ?? String(e))
    return
  }
  const [instance, api] = getOrCreateInstanceAndAPI(aiService)

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
