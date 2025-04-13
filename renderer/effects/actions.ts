import { useEffect } from 'react'
import type { Actions } from 'spirit'

import { ipcRenderer } from '../electron'
import { ee } from '../instances/ee'
import { electronStore, keyAtom } from '../store'

ee.on('act', (type, ...args) => {
  if (type === 'wechat') {
    const [arg] = args
    ipcRenderer.send('wechat', arg)
    electronStore.set(keyAtom('display')!, false)
  }
})

export const useAct = <K extends keyof Actions>(type: K, callback: (...args: Actions[K]) => void) => {
  useEffect(() =>
    ee.on('act', (lisType, ...args) => {
      // @ts-ignore
      if (lisType !== type) return

      callback(...(args as Actions[K]))
    }), [callback, type])
}
