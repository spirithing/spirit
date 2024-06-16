declare module 'spirit' {
  export interface AIServiceOptions {
    openai: {
      apiHost: string
      apiKey: string
      defaultModel: string
    }
    ollama: {
      apiHost: string
      defaultModel: string
    }
  }
  // dprint-ignore
  export type AIServiceOption = keyof AIServiceOptions extends infer K
    ? K extends string
      ? {
        type: K
      } & AIServiceOptions[K]
      : never
    : never
  export interface AIService {
    uuid: string
    name: string
    description?: string
    avatar?: string
    option: AIServiceOption
  }
  export interface Store {
    defaultAIServiceUUID?: AIService['uuid']
    aiServices: AIService[]
  }
}
