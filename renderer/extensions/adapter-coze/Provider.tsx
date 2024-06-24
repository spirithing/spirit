import { createContext, useContext } from 'react'
import type { AIServiceAPIAdapter, AIServiceCreators } from 'spirit'

const Context = createContext<
  null | {
    instance: AIServiceCreators['coze']
    api: AIServiceAPIAdapter<'coze'>
  }
>(null)

export const CozeProvider = Context.Provider
export const useCoze = () => useContext(Context)
