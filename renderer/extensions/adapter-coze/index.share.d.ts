declare module 'spirit' {
  export interface AIServiceCreators {
    coze: {}
  }
  export interface AIServiceAPIOptionsForChat {
    coze: {
      model: string
    }
  }
  export interface AIServiceOptions {
    coze: {
      apiHost: string
      defaultModel: string
    }
  }
}
