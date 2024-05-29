import type { ClientOptions } from 'openai'

declare module 'spirit' {
  export interface Store {
    openaiConfig: ClientOptions
  }
}
