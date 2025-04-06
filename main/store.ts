import * as fs from 'node:fs'
import * as path from 'node:path'

import { BrowserWindow, ipcMain } from 'electron'
import type { Store } from 'spirit'

import { getOrCreateUserSubDir } from './utils/system'

const configsPath = getOrCreateUserSubDir('configs')
const configs = fs
  .readdirSync(configsPath)
  .filter(file => file.endsWith('.json'))
const config: Record<string, unknown> = {}
configs.forEach(configPath => {
  const absConfigPath = path.resolve(configsPath, configPath)
  const name = path.basename(absConfigPath, '.json')
  if (!fs.existsSync(absConfigPath)) {
    fs.writeFileSync(absConfigPath, '{}')
  }
  const configStr = fs.readFileSync(absConfigPath, 'utf-8')
  try {
    config[name] = JSON.parse(configStr)
  } catch (e) {
    console.error('Failed to parse config:', e)
  }
})

const storeListenersMap = new Map<string, Map<string, (value: unknown) => void>>()
const store = new Map<string, unknown>()
for (const [key, value] of Object.entries(config)) {
  store.set(key, value)
}
export function setStore<
  K extends keyof Store,
>(key: K, value: Store[K], uuid?: string) {
  store.set(key, value)
  const configPath = path.resolve(configsPath, `${key}.json`)
  fs.writeFileSync(configPath, JSON.stringify(value ?? {}, null, 2))
  const storeListeners = storeListenersMap.get(key)
  if (!storeListeners || storeListeners.size === 0) return
  storeListeners.forEach((listener, storeUUID) => {
    if (uuid !== undefined && storeUUID === uuid) return
    listener(value)
  })
}
export function getStore<K extends keyof Store>(key: K) {
  return store.get(key) as Store[K]
}
export function watch<K extends keyof Store>(key: K, listener: (value: Store[K]) => void, uuid: string) {
  const storeListeners = storeListenersMap.get(key) ?? new Map()
  if (!storeListenersMap.has(key)) {
    storeListenersMap.set(key, storeListeners)
  }
  storeListeners.set(uuid, listener)
}
ipcMain.handle('getStore', (_, key: string) => {
  return getStore(key as keyof Store)
})
ipcMain.on('setStore', (event, uuid: string, key: string, value: unknown) => {
  const keyExists = store.has(key)
  // @ts-ignore
  setStore(key, value, uuid)
  if (!keyExists) {
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('addKey', key)
    })
  } else if (value === null) {
    BrowserWindow.getAllWindows().forEach(window => {
      window.webContents.send('delKey', key)
    })
  }
  event.returnValue = true
})
ipcMain.on('listenStore', (event, key: string, uuid: string) => {
  watch(
    key as keyof Store,
    (v: unknown) => event.sender.send(`storeChange:${uuid}`, v, key),
    uuid
  )
  event.returnValue = true
})
ipcMain.on('unlistenStore', (event, key: string, uuid: string) => {
  const storeListeners = storeListenersMap.get(key)
  if (!storeListeners) return
  storeListeners.delete(uuid)
  if (storeListeners.size === 0) {
    storeListenersMap.delete(key)
  }
  event.returnValue = true
})
ipcMain.handle('getStores', () => {
  return Array.from(store.keys())
})
