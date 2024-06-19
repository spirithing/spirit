import type { Bot, IMessage } from 'spirit'

declare module 'spirit' {
  export interface AIServiceCreators {
  }
  export interface AIServiceAPIOptionsForChat {
  }
  export interface AIServiceAPIAdapter<K extends keyof AIServiceOptions> {
    chat(
      instance: AIServiceCreators[K],
      bot: Bot,
      messages: IMessage[],
      adapterOptions?: AIServiceOptions[K],
      options?: AIServiceAPIOptionsForChat[K]
    ): AsyncIterable<[string, {
      status: 'started' | 'running' | 'completed'
    }]>
  }
  export interface AIServiceOptions {
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
    aiServices?: AIService[]
  }
}
