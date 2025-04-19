import type CozeQuester from './Quester'

declare module 'spirit' {
  export interface AIServiceCreators {
    coze: CozeQuester
  }
  export interface AIServiceAPIOptionsForChatMap {
    coze: {
      botID: string
    }
  }
  export interface AIServiceOptionsMap {
    coze: {
      apiHost?: string
      bearerToken: string
      defaultBotID: string
    }
  }
}
