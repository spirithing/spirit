import { atom, createStore } from 'jotai'
import type { PrimitiveAtom } from 'jotai/vanilla/atom'
import type { Store } from 'spirit'

import { ipcRenderer } from './electron'

export type WithInitialValue<T> = { init: T }

export const electronStore = createStore()

export const atoms = {} as {
  [K in keyof Store]: PrimitiveAtom<Store[K]> & WithInitialValue<Store[K]>
}
export type Atoms = typeof atoms

export const uuids = new Map<string, string>()
export const keysAtom = atom(Object.keys(atoms))

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
