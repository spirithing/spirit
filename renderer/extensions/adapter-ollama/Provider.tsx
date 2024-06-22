import { createContext, useContext } from 'react'
import type { AIServiceAPIAdapter, AIServiceCreators } from 'spirit'

const Context = createContext<
  null | {
    instance: AIServiceCreators['ollama']
    api: AIServiceAPIAdapter<'ollama'>
  }
>(null)

export const OllamaProvider = Context.Provider
export const useOllama = () => useContext(Context)
