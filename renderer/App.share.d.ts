import type { ClientOptions } from 'openai'

declare module 'spirit' {
  export interface Bot {
    name: string
    description?: string
  }
  export interface Store {
    bot: Bot
    openaiConfig: ClientOptions
  }
}
