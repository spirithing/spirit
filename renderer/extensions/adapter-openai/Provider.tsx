import { createContext, useContext } from 'react'
import type { AIServiceAPIAdapter, AIServiceCreators } from 'spirit'

const Context = createContext<
  null | {
    instance: AIServiceCreators['openai']
    api: AIServiceAPIAdapter<'openai'>
  }
>(null)

export const OpenAIProvider = Context.Provider
export const useOpenAI = () => useContext(Context)
