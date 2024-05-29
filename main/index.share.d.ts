import { type Result as ActiveWindow } from 'get-windows'

declare module 'spirit' {
  export interface Store {
    display?: boolean
    activeWindow?: ActiveWindow
    'activeWindow:Error'?: string
  }
}
