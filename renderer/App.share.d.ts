import type { ClientOptions } from 'openai'

declare module 'spirit' {
  export interface User {
    name: string
  }
  export interface Bot {
    name: string
    description?: string
  }
  export interface Store {
    user: User
    bot: Bot
    openaiConfig: ClientOptions
  }
}
