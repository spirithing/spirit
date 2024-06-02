import { atom } from 'jotai'
import OpenAI from 'openai'

import { electronStore, keyAtom } from '../store'

export function createOpenAI() {
  const configAtom = keyAtom('openaiConfig')
  if (!configAtom) return null
  const config = electronStore.get(configAtom)
  if (!config || !config.apiKey || !config.baseURL) return null
  return new OpenAI({
    ...config,
    dangerouslyAllowBrowser: true
  })
}

export const openAIAtom = atom(createOpenAI())
