import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  var electron: ElectronAPI
  var api: unknown
  export interface Window {
    electron: ElectronAPI
    api: unknown
  }
}

export {}
