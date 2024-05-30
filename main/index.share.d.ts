import { type Result as ActiveWindow } from 'get-windows'

declare module 'spirit' {
  export interface System {
    os: string
    username: string
  }
  export interface Store {
    display?: boolean
    system?: System
    activeWindow?: ActiveWindow
    'activeWindow:Error'?: string
  }
}
