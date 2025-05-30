import { type Result as ActiveWindow } from 'get-windows'

declare module 'spirit' {
  export interface System {
    os: string
    username: string
  }
  export interface Shortcuts {
    start?: string[]
    send?: string[]
  }
  export interface Application {
    name: string
    path: string
    info?: string
    icon?: string | null
    version?: string
    lastModified: string
  }
  export interface WeChat {
    icon?: { path?: string }
    title?: string
    subTitle?: string
    arg: string
  }
  export interface Store {
    display?: boolean
    system?: System
    applications?: Application[]
    wechats?: WeChat[]
    shortcuts?: Shortcuts
    activeWindow?: ActiveWindow
    'activeWindow:Error'?: string
  }
}
declare module 'spirit' {
  export interface BridgeContext {
    method: string
  }
  export interface BridgeCalledContext extends BridgeContext {
    traceID: string
  }
  export interface SyncMethodRtn {
    type: 'promise' | 'success' | 'error'
    resp: any
  }
  export interface BridgeMethods {
    openApplication(path: string): Promise<void>
  }
  export interface BridgeSyncMethods {
  }
  export type Bridge =
    & BridgeMethods
    & {
      sync: BridgeSyncMethods
    }
}
declare module 'spirit' {
  export interface Lifecycle {
    processStart: []
    appReady: []
    shortcut: [key: keyof Shortcuts]
    consoleWindowShow: []
  }
}
