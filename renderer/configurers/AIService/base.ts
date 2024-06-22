import type { AIService, AIServiceOptions } from 'spirit'

import type { AIServiceAdapter } from '../../extension'
import AdapterOllama from '../../extensions/adapter-ollama'
import AdapterOpenAI from '../../extensions/adapter-openai'
import { getThrowWhenUndefined } from '../../store'

export function getDefaultAIService(uuid?: string) {
  const aiServiceDefaultUUID = uuid ?? getThrowWhenUndefined('defaultAIServiceUUID')
  const aiServices = getThrowWhenUndefined('aiServices')
  return aiServices.find(s => s.uuid === aiServiceDefaultUUID)
}
const instances = new WeakMap<
  AIService['option'],
  ReturnType<
    AIServiceAdapter<keyof AIServiceOptions>['creator']
  >
>()
function getOrCreateInstance(option: AIService['option']): ReturnType<
  AIServiceAdapter<AIService['option']['type']>['creator']
> {
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
export function getOrCreateInstanceAndAPI<
  K extends keyof AIServiceOptions,
  A extends AIServiceAdapter<K>,
>(
  option: AIService['option'] & { type: K }
): [ReturnType<A['creator']>, A['api']] {
  const instance = getOrCreateInstance(option)
  const api = apis[option.type]
  if (!api) throw new Error('API not found, please check your configuration')
  return [
    instance as ReturnType<A['creator']>,
    api as A['api']
  ]
}

export const apis = {
  openai: AdapterOpenAI.api,
  ollama: AdapterOllama.api
}

export const creators = {
  openai: AdapterOpenAI.creator,
  ollama: AdapterOllama.creator
}

export const types = {
  openai: AdapterOpenAI.type,
  ollama: AdapterOllama.type
}

export const aiServiceOptionConfigurerMapping = {
  openai: AdapterOpenAI.Writer,
  ollama: AdapterOllama.Writer
}
