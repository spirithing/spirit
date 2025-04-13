import { ipcMain } from 'electron'
import type { BridgeCalledContext, BridgeMethods, SyncMethodRtn } from 'spirit'

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
