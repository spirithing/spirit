import type { ClientOptions } from 'openai'

declare module 'spirit' {
  export interface IUser {
    name: string
  }
  export interface Bot {
    name: string
    description?: string
  }
  export interface Store {
    bot: Bot
    openaiConfig: ClientOptions & {
      defaultModel?: string
    }
  }
}
