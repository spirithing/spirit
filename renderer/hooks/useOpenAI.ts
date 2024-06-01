import { atom, useAtom } from 'jotai'
import OpenAI from 'openai'

import { keyAtom, subAtomByKey } from '../store'
import { electronStore } from '../store.init'

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
