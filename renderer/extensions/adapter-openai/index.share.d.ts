declare module 'spirit' {
  import type OpenAI from 'openai'

  export interface AIServiceCreators {
    openai: OpenAI
  }
  export interface AIServiceAPIOptionsForChat {
    openai: {
      model: string
    }
  }
  export interface AIServiceOptions {
    openai: {
      apiHost: string
      apiKey: string
      defaultModel: string
    }
  }
}
