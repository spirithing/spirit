declare module 'spirit' {
  import type { Ollama } from 'ollama/browser'

  export interface AIServiceCreators {
    ollama: Ollama
  }
  export interface AIServiceAPIOptionsForChatMap {
    ollama: {
      model: string
    }
  }
  export interface AIServiceOptionsMap {
    ollama: {
      apiHost: string
      defaultModel: string
    }
  }
}
