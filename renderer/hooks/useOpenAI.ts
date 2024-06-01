import { atom, useAtom } from 'jotai'
import OpenAI from 'openai'

import { electronStore, keyAtom, subAtomByKey } from '../store'

const configAtom = keyAtom('openaiConfig')

function createOpenAI() {
  if (!configAtom) return
  const config = electronStore.get(configAtom)
  if (!config || !config.apiKey || !config.baseURL) return
  return new OpenAI({
    ...config,
    dangerouslyAllowBrowser: true
  })
}

const openAIAtom = atom(createOpenAI())
subAtomByKey('openaiConfig', () => electronStore.set(openAIAtom, createOpenAI()))

export const useOpenAI = () => useAtom(openAIAtom)[0]
