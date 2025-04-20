import type { AIService, AIServiceOptionsMap } from 'spirit'

import type { AIServiceAdapter } from '#renderer/extension.ts'
import AdapterCoze from '#renderer/extensions/adapter-coze/index.tsx'
import AdapterOllama from '#renderer/extensions/adapter-ollama/index.tsx'
import AdapterOpenAI from '#renderer/extensions/adapter-openai/index.tsx'
import { getThrowWhenUndefined } from '#renderer/store.ts'

export function getTargetOrDefaultAIService(uuid?: string) {
  const aiServiceUUID = uuid ?? getThrowWhenUndefined('defaultAIServiceUUID')
  const aiServices = getThrowWhenUndefined('aiServices')
  const aiService = aiServices.find(s => s.uuid === aiServiceUUID)
  if (!aiService) {
    throw new Error(`AI Service [${aiServiceUUID}] not found`)
  }
  return aiService
}

const instances = new WeakMap<
  AIService['options'],
  ReturnType<
    AIServiceAdapter<keyof AIServiceOptionsMap>['creator']
  >
>()
function getOrCreateInstance(option: AIService['options']): ReturnType<
  AIServiceAdapter<AIService['options']['type']>['creator']
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
  K extends keyof AIServiceOptionsMap,
  A extends AIServiceAdapter<K>,
>(
  option: AIService['options'] & { type: K }
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
  ollama: AdapterOllama.api,
  coze: AdapterCoze.api
}

export const creators = {
  openai: AdapterOpenAI.creator,
  ollama: AdapterOllama.creator,
  coze: AdapterCoze.creator
}

export const types = {
  openai: AdapterOpenAI.type,
  ollama: AdapterOllama.type,
  coze: AdapterCoze.type
}

export const aiServiceOptionConfigurerMapping = {
  openai: AdapterOpenAI.Writer,
  ollama: AdapterOllama.Writer,
  coze: AdapterCoze.Writer
}

export const aiServiceExtensionMap = {
  openai: AdapterOpenAI,
  ollama: AdapterOllama,
  coze: AdapterCoze
}
