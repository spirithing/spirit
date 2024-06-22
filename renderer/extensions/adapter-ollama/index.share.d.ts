declare module 'spirit' {
  import type { Ollama } from 'ollama/browser'

  export interface AIServiceCreators {
    ollama: Ollama
  }
  export interface AIServiceAPIOptionsForChat {
    ollama: {
      model: string
    }
  }
  export interface AIServiceOptions {
    ollama: {
      apiHost: string
      defaultModel: string
    }
  }
}
