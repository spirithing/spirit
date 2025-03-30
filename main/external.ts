import { exec } from 'node:child_process'

import { ipcMain } from 'electron'
import type { BridgeCalledContext, BridgeMethods, SyncMethodRtn } from 'spirit'

import { isMac } from './utils/system'

const bridgeMethods: BridgeMethods = {
  async open(path: string): Promise<void> {
    if (isMac) {
      await new Promise<void>((ok, no) =>
        exec(`open -a "${path}" && osascript -e 'tell application "${path}" to activate'`, error => {
          error ? no(error) : ok()
        })
      )
      return
    }
    throw new Error('Unsupported platform')
  }
}

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

ipcMain.on('open', (_, path) => {
  if (isMac) {
    exec(`open -a "${path}" && osascript -e 'tell application "${path}" to activate'`, error => {
      if (error) {
        console.error(error)
      }
    })
    return
  }
})
ipcMain.on('wechat', (_, id) => {
  if (isMac) {
    fetch(`http://localhost:48065/wechat/start?session=${id}`)
      .catch(console.error)
    return
  }
})
