declare module 'spirit' {
  export interface AIServiceOptions {
    openai: {
      apiHost: string
      apiKey: string
      defaultModel: string
    }
  }
}
