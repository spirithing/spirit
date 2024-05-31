import { atom, useAtom } from 'jotai'
import type { PrimitiveAtom } from 'jotai/vanilla/atom'
import { useCallback, useMemo } from 'react'
import type { Store } from 'spirit'

import { ipcRenderer } from './electron'
import type { Atoms, WithInitialValue } from './store.init'
import { atoms, electronStore, keysAtom, uuids } from './store.init'

const defaultAtom = atom(null)

const useKeyAtom = <K extends keyof Store>(key: K):
  | Atoms[K]
  | PrimitiveAtom<null> & WithInitialValue<null> =>
{
  const [keys] = useAtom(keysAtom, { store: electronStore })
  return useMemo(() => keys.includes(key), [keys, key])
    ? atoms[key] as Atoms[K] ?? defaultAtom
    : defaultAtom
}

export const useElectronStore = <K extends keyof Store>(key: K, defaultValue?: Store[K]) => {
  const keyAtom = useKeyAtom(key)
  const [value, setValue] = useAtom(keyAtom, { store: electronStore })
  const memoValue = useMemo(() => value ?? defaultValue, [value, defaultValue])
  const updateValue = useCallback((value: Store[K] | ((prev?: Store[K]) => Store[K])) => {
    let v = value
    if (typeof value === 'function') {
      v = value(memoValue)
    }
    if (keyAtom !== defaultAtom) {
      // @ts-ignore
      setValue(v)
    } else {
      const uuid = uuids.get(key) ?? Math.random().toString(36).slice(2)
      uuids.set(key, uuid)
      ipcRenderer.sendSync('setStore', uuid, key, v)
    }
  }, [key, keyAtom, memoValue, setValue])
  return [memoValue, updateValue] as const
}
