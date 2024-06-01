import { atom } from 'jotai'
import type { Store } from 'spirit'

import { keysAtom } from '../atoms/keys'
import { ipcRenderer } from '../electron'
import { atoms, electronStore } from '../store'
import { keyUUID } from '../utils/keyUUIDs'


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
