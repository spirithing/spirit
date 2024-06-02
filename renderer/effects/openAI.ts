import { subAtomByKey } from '../atoms/keys'
import { createOpenAI, openAIAtom } from '../atoms/openAI'
import { electronStore } from '../store'

subAtomByKey('openaiConfig', () => {
  const current = createOpenAI()
  if (current) {
    electronStore.set(openAIAtom, current)
  }
})
