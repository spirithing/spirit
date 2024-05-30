import { atom, createStore, useAtom } from 'jotai'
import type { PrimitiveAtom } from 'jotai/vanilla/atom'
import { useCallback, useMemo } from 'react'
import type { Store } from 'spirit'

import { ipcRenderer } from './electron'

type WithInitialValue<T> = { init: T }

export const electronStore = createStore()
const defaultAtom = atom(null)
export const atoms = {} as {
  [K in keyof Store]: PrimitiveAtom<Store[K]> & WithInitialValue<Store[K]>
}
const uuids = new Map<string, string>()
type Atoms = typeof atoms
const keysAtom = atom(Object.keys(atoms))

const useKeyAtom = <K extends keyof Store>(key: K):
  | Atoms[K]
  | PrimitiveAtom<null> & WithInitialValue<null> =>
{
  const [keys] = useAtom(keysAtom, { store: electronStore })
  return useMemo(() => keys.includes(key), [keys, key])
    ? atoms[key] as Atoms[K]
    : defaultAtom
}

export const useElectronStore = <K extends keyof Store>(key: K) => {
  const keyAtom = useKeyAtom(key)
  const [value, setValue] = useAtom(keyAtom, { store: electronStore })
  const updateValue = useCallback((value: Store[K]) => {
    if (keyAtom !== defaultAtom) {
      // @ts-ignore
      setValue(value)
    } else {
      const uuid = uuids.get(key) ?? Math.random().toString(36).slice(2)
      uuids.set(key, uuid)
      ipcRenderer.sendSync('setStore', uuid, key, value)
    }
  }, [key, keyAtom, setValue])
  return [value, updateValue] as const
}

async function createKeyAtom(key: string) {
  const value = await ipcRenderer.invoke('getStore', key)
  const keyAtom = atom(value)
  atoms[key] = keyAtom
  const uuid = uuids.get(key) ?? Math.random().toString(36).slice(2)
  uuids.set(key, uuid)
  ipcRenderer.sendSync('listenStore', key, uuid)
  ipcRenderer.on(`storeChange:${uuid}`, (_, value: unknown) => {
    electronStore.set(keyAtom, value)
  })
  electronStore.sub(keyAtom, () => {
    const value = electronStore.get(keyAtom)
    ipcRenderer.sendSync('setStore', uuid, key, value)
  })
  return keyAtom
}

let keys: string[] = await ipcRenderer.invoke('getStores')
keys.forEach(createKeyAtom)
electronStore.set(keysAtom, keys)
ipcRenderer.on('addKey', async (_, key: string) => {
  await createKeyAtom(key)
  keys = [...keys, key]
  electronStore.set(keysAtom, keys)
})
ipcRenderer.on('delKey', (_, key: string) => {
  delete atoms[key]
  keys = keys.filter(k => k !== key)
  electronStore.set(keysAtom, keys)
})
