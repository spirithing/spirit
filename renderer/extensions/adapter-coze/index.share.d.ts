import type CozeQuester from './Quester'

declare module 'spirit' {
  export interface AIServiceCreators {
    coze: CozeQuester
  }
  export interface AIServiceAPIOptionsForChat {
    coze: {
      botID: string
    }
  }
  export interface AIServiceOptions {
    coze: {
      apiHost?: string
      bearerToken: string
      defaultBotID: string
    }
  }
}
