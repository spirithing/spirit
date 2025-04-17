import type { IpcRendererEvent } from 'electron'
import type { Bridge, BridgeCalledContext, BridgeContext, MainEventMap, SyncMethodRtn, WebviewEventMap } from 'spirit'

import { ipcRenderer } from './electron'

export const bridge = new Proxy({} as Bridge, {
  get(_, method) {
    if (typeof method !== 'string') {
      throw new TypeError('Method name must be a string')
    }
    const ctx: BridgeContext = {
      method
    }
    if (method === 'sync') {
      return new Proxy({}, {
        get(_, method) {
          if (typeof method !== 'string') {
            throw new TypeError('Method name must be a string')
          }
          return (...args: unknown[]) => {
            const traceID = Math.random().toString(36).slice(2)
            const calledContext: BridgeCalledContext = {
              ...ctx,
              traceID
            }
            const { type, resp } = ipcRenderer.sendSync('callSync', calledContext, ...args) as SyncMethodRtn
            if (type === 'promise') {
              throw new TypeError(`Method "${method}" is not synchronous`)
            }
            if (type === 'error') {
              // @ts-ignore
              Object.assign(resp, calledContext)
              throw resp
            }
            return resp
          }
        }
      })
    }
    return (...args: unknown[]) => {
      const traceID = Math.random().toString(36).slice(2)
      const calledContext: BridgeCalledContext = {
        ...ctx,
        traceID
      }
      try {
        return ipcRenderer.invoke('call', calledContext, ...args)
      } catch (e) {
        // @ts-ignore
        Object.assign(e, calledContext)
        throw e
      }
    }
  }
})

export const peer = {
  on: <K extends keyof MainEventMap & string>(
    k: K,
    callback: (...args: [IpcRendererEvent, ...MainEventMap[K]]) => void
  ) => ipcRenderer.on(k, callback),
  once: <K extends keyof MainEventMap & string>(
    k: K,
    callback: (...args: [IpcRendererEvent, ...MainEventMap[K]]) => void
  ) => ipcRenderer.once(k, callback),
  off: <K extends keyof MainEventMap & string>(
    k: K,
    callback: (...args: [IpcRendererEvent, ...MainEventMap[K]]) => void
  ) => ipcRenderer.removeListener(k, callback),
  emit: <K extends keyof WebviewEventMap & string>(
    k: K,
    ...args: WebviewEventMap[K]
  ) => ipcRenderer.send(k, ...args)
}
