import { atom, useAtom } from 'jotai'
import OpenAI from 'openai'

import { subAtomByKey } from '../atoms/keys'
import { electronStore, keyAtom } from '../store'

function createOpenAI() {
  const configAtom = keyAtom('openaiConfig')
  if (!configAtom) return null
  const config = electronStore.get(configAtom)
  if (!config || !config.apiKey || !config.baseURL) return null
  return new OpenAI({
    ...config,
    dangerouslyAllowBrowser: true
  })
}

const openAIAtom = atom(createOpenAI())
subAtomByKey('openaiConfig', () => {
  const current = createOpenAI()
  if (current) {
    electronStore.set(openAIAtom, current)
  }
})

export const useOpenAI = () => useAtom(openAIAtom, { store: electronStore })[0]
