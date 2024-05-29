import * as fs from 'node:fs'

import { app, BrowserWindow, ipcMain } from 'electron'

const appPath = app.getPath('userData')
if (!fs.existsSync(appPath)) {
  fs.mkdirSync(appPath)
}
const configPath = appPath + '/config.json'
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, '{}')
}
const configStr = fs.readFileSync(configPath, 'utf-8')
let config: Record<string, unknown> = {}
try {
  config = JSON.parse(configStr)
  if (typeof config !== 'object') {
    throw new Error('Invalid config')
  }
} catch (e) {
  console.error('Failed to parse config:', e)
}

const storeListenersMap = new Map<string, Map<string, (value: unknown) => void>>()
const store = new Map<string, unknown>()
for (const [key, value] of Object.entries(config)) {
  store.set(key, value)
}
function setStore(uuid: string, key: string, value: unknown) {
  store.set(key, value)
  fs.writeFileSync(configPath, JSON.stringify(Object.fromEntries(store.entries())))
  const storeListeners = storeListenersMap.get(key)
  if (!storeListeners || storeListeners.size === 0) return
  storeListeners.forEach((listener, key) => {
    if (key === uuid) return
    listener(value)
  })
}
function getStore(key: string) {
  return store.get(key)
}
ipcMain.handle('getStore', (_, key: string) => {
  return getStore(key)
})
ipcMain.on('setStore', (event, uuid: string, key: string, value: unknown) => {
  const keyExists = store.has(key)
  setStore(uuid, key, value)
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
  const storeListeners = storeListenersMap.get(key) ?? new Map()
  if (!storeListenersMap.has(key)) {
    storeListenersMap.set(key, storeListeners)
  }
  storeListeners.set(uuid, (v: unknown) => event.sender.send(`storeChange:${uuid}`, v, key))
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
