import type { ClientOptions } from 'openai'

declare module 'spirit' {
  export interface IUser {
    name: string
  }
  export interface Store {
    theme: Theme
    openaiConfig: ClientOptions & {
      defaultModel?: string
    }
  }
}
