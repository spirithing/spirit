declare module 'spirit' {
  import type OpenAI from 'openai'

  export interface AIServiceCreators {
    openai: OpenAI
  }
  export interface AIServiceAPIOptionsForChatMap {
    openai: {
      model: string
    }
  }
  export interface AIServiceOptionsMap {
    openai: {
      apiHost: string
      apiKey: string
      defaultModel: string
    }
  }
}
