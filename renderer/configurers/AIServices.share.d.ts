declare module 'spirit' {
  export interface AIServiceCreators {
  }
  export interface AIServiceAPIAdapter<K extends keyof AIServiceOptionsMap> {
    chat(
      instance: AIServiceCreators[K],
      bot: Bot,
      messages: IMessage[],
      adapterOptions?: AIServiceOptionsMap[K] & {
        chat?: AIServiceAPIOptionsForChatMap[K]
      },
      options?: {
        tools?: ITool[]
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
  export interface AIServiceOptionsMap {
  }
  // dprint-ignore
  export type AIServiceOptions = keyof AIServiceOptionsMap extends infer K
    ? K extends string
      ? {
        type: K
        chat?: AIServiceAPIOptionsForChat[K]
      } & AIServiceOptionsMap[K]
      : never
    : never
  export interface AIServiceAPIOptionsForChatMap {
  }
  // dprint-ignore
  export type AIServiceAPIOptionsForChat = keyof AIServiceAPIOptionsForChatMap extends infer K
    ? K extends string
      ? {
      type: K
    } & AIServiceAPIOptionsForChatMap[K]
      : never
    : never
  export interface AIService {
    uuid: string
    name: string
    description?: string
    avatar?: string
    options: AIServiceOptions
  }
  export interface Store {
    defaultAIServiceUUID?: AIService['uuid']
    aiServices?: AIService[]
  }
}
