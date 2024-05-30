import type { ClientOptions } from 'openai'

declare module 'spirit' {
  export interface Common {
    locale: string | 'system'
  }
  export interface User {
    name: string
  }
  export interface Bot {
    name: string
    description?: string
  }
  export interface Store {
    common: Common
    user: User
    bot: Bot
    openaiConfig: ClientOptions
  }
}
