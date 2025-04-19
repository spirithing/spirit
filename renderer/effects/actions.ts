import { useEffect } from 'react'
import type { Actions } from 'spirit'

import { ipcRenderer } from '#renderer/electron.ts'
import { useEventCallback } from '#renderer/hooks/useEventCallback.ts'
import { ee } from '#renderer/instances/ee.ts'
import { electronStore, keyAtom } from '#renderer/store.ts'

ee.on('act', (type, ...args) => {
  if (type === 'wechat') {
    const [arg] = args
    ipcRenderer.send('wechat', arg)
    electronStore.set(keyAtom('display')!, false)
  }
})

export const useAct = <K extends keyof Actions>(type: K, callback: (...args: Actions[K]) => void) => {
  const cb = useEventCallback(callback)
  useEffect(() =>
    ee.on('act', (lisType, ...args) => {
      // @ts-ignore
      if (lisType !== type) return

      cb(...(args as Actions[K]))
    }), [cb, type])
}
