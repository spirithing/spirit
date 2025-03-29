import type { Bot, IMessage, IToolCall } from 'spirit'

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
      options?: AIServiceAPIOptionsForChat[K] & {
        tools?: {
          type: string
          function: {
            name: string
            description: string
            parameters: {
              type: string
              required: string[]
              properties: {
                [key: string]: {
                  type: string
                  description: string
                  enum?: string[]
                }
              }
            }
            strict?: boolean
          }
        }[]
      }
    ): AsyncIterable<[string, {
      toolCalls?: IToolCall[]
      status: 'started' | 'running' | 'completed'
    }]>
    models(instance: AIServiceCreators[K]): Promise<{
      id: string
      label?: string
      created?: number
    }[]>
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
