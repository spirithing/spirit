import { atom, createStore } from 'jotai'
import type { PrimitiveAtom } from 'jotai/vanilla/atom'
import type { Events, Store } from 'spirit'

import { ipcRenderer } from './electron'
import { EventEmitter } from './utils/EventEmitter'
import { keyUUID } from './utils/keyUUIDs'

export type WithInitialValue<T> = { init: T }

export const electronStore = createStore()

export const ee = new EventEmitter<Events>()

export const keyAtom = <K extends keyof Store>(key: K):
  | Atoms[K]
  | PrimitiveAtom<null> & WithInitialValue<null> => atoms[key] as Atoms[K]

export const atoms = {} as {
  [K in keyof Store]: PrimitiveAtom<Store[K]> & WithInitialValue<Store[K]>
}
export type Atoms = typeof atoms

export const keysAtom = atom(Object.keys(atoms))

export function subAtomByKey<
  K extends keyof Store,
>(
  id: K,
  callback: () => void,
  dispose = () => {}
) {
  const atom = keyAtom(id)
  let disposeSub: () => void
  if (atom) {
    disposeSub = electronStore.sub(atom, callback)
    dispose()
  } else {
    const dispose = electronStore.sub(keysAtom, () => {
      disposeSub = subAtomByKey(id, callback, dispose)
    })
  }
  return () => disposeSub?.()
}

async function createKeyAtom(key: string) {
  const value = await ipcRenderer.invoke('getStore', key)
  const keyAtom = atom(value)
  atoms[key] = keyAtom
  const uuid = keyUUID(key as keyof Store, true)
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
await Promise.all(
  keys
    .map(createKeyAtom)
)
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
