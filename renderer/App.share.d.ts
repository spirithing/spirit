import type { ClientOptions } from 'openai'
import type { BundledTheme } from 'shiki'

declare module 'spirit' {
  export interface IUser {
    name: string
  }
  export interface Bot {
    name: string
    description?: string
  }
  export interface Theme {
    highlightTheme?: BundledTheme
  }
  export interface Store {
    bot: Bot
    theme: Theme
    openaiConfig: ClientOptions & {
      defaultModel?: string
    }
  }
}
