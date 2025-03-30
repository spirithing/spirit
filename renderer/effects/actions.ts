import type { Bridge, BridgeCalledContext, BridgeContext, SyncMethodRtn } from 'spirit'

import { ipcRenderer } from '../electron'
import { ee } from '../instances/ee'
import { electronStore, keyAtom } from '../store'

ee.on('act', (type, ...args) => {
  if (type === 'open') {
    const [path] = args
    ipcRenderer.send('open', path)
    electronStore.set(keyAtom('display')!, false)
  }
  if (type === 'wechat') {
    const [arg] = args
    ipcRenderer.send('wechat', arg)
    electronStore.set(keyAtom('display')!, false)
  }
})

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
