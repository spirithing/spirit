import { ipcMain, type IpcMainEvent } from 'electron'
import type { BridgeCalledContext, BridgeMethods, MainEventMap, SyncMethodRtn, WebviewEventMap } from 'spirit'

import * as apis from './apis'
import { isMac } from './utils/system'

const bridgeMethods = {} as BridgeMethods
Object.assign(bridgeMethods, apis)

ipcMain.handle('call', async (_, ctx: BridgeCalledContext, ...args: unknown[]) => {
  try {
    const { method } = ctx
    if (!(method in bridgeMethods)) {
      throw new Error(`Method "${method}" not found`)
    }
    return await bridgeMethods[method](...args)
  } catch (e) {
    // @ts-ignore
    Object.assign(e, ctx)
    throw e
  }
})

ipcMain.on('callSync', (_, ctx: BridgeCalledContext, ...args: unknown[]) => {
  let rtn: SyncMethodRtn
  try {
    const { method } = ctx
    if (!(method in bridgeMethods)) {
      throw new Error(`Method "${method}" not found`)
    }
    const resp = bridgeMethods[ctx.method](...args)
    if (resp instanceof Promise) {
      rtn = {
        type: 'promise',
        resp: null
      }
    } else {
      rtn = {
        type: 'success',
        resp
      }
    }
  } catch (e) {
    // @ts-ignore
    Object.assign(e, ctx)
    rtn = {
      type: 'error',
      resp: JSON.stringify(e)
    }
  }
  return rtn
})

ipcMain.on('wechat', (_, id) => {
  if (isMac) {
    fetch(`http://localhost:48065/wechat/start?session=${id}`)
      .catch(console.error)
    return
  }
})

type AllWebviewEventMap = WebviewEventMap

const webContentsMap = new Map<string, Electron.WebContents>()

export const setWebContents = <
  K extends keyof MainEventMap & string,
>(k: K, webContents: Electron.WebContents) => {
  webContentsMap.set(k, webContents)
}

export const peer = {
  on: <K extends keyof AllWebviewEventMap & string>(
    k: K,
    callback: (...args: [IpcMainEvent, ...AllWebviewEventMap[K]]) => void
  ) => ipcMain.on(k, callback),
  once: <K extends keyof AllWebviewEventMap & string>(
    k: K,
    callback: (...args: [IpcMainEvent, ...AllWebviewEventMap[K]]) => void
  ) => ipcMain.once(k, callback),
  off: <K extends keyof AllWebviewEventMap & string>(
    k: K,
    callback: (...args: [IpcMainEvent, ...AllWebviewEventMap[K]]) => void
  ) => ipcMain.removeListener(k, callback),
  emit: <
    K extends keyof MainEventMap & string,
    T extends keyof MainEventMap[K] & string,
  >(
    k: K,
    t: T,
    ...args: MainEventMap[K][T]
  ) => {
    webContentsMap.get(k)?.send(t, ...args)
  }
}
