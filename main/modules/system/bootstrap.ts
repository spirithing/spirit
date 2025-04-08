import url from 'node:url'

import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app, globalShortcut, protocol, shell } from 'electron'
import { activeWindow } from 'get-windows'

import { ee } from '../../lifecycle'
import { setStore } from '../../store'
import { os, username } from '../../utils/system'

ee.on('processStart', () => {
  app.dock?.hide()
  setStore('system', { os, username })
  setTimeout(async function loop() {
    try {
      setStore('activeWindow', await activeWindow())
      setStore('activeWindow:Error', undefined)
    } catch (e) {
      console.error(e)
      setStore('activeWindow:Error', String(e))
    }
    setTimeout(loop, 3000)
  }, 0)

  app.on('window-all-closed', () => {
    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    if (process.platform !== 'darwin') app.quit()
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
  })
})

ee.on('appReady', () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('yij.ie.spirit')

  // open external link in default browser
  const schema = 'spirit-oe'
  protocol.registerHttpProtocol(schema, request => {
    const url = request.url.substr(schema.length)
    shell.openExternal(`https${url}`)
  })
  protocol.registerFileProtocol('atom', (request, callback) => {
    const filePath = url.fileURLToPath('file://' + request.url.slice('atom://'.length))
    callback(filePath)
  })
  // TODO protocol.unregisterProtocol
})
