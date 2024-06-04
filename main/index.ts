import './store'

// TODO listen language change by os-locale
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, type Display, globalShortcut, protocol, screen, shell } from 'electron'
import { activeWindow } from 'get-windows'
import { join } from 'path'

import icon from '../resources/icon.png?asset'
import { lisStore, setStore } from './store'
import { os, username } from './utils/system'

function createWindow() {
  const displayStoreUUID = Math.random().toString(36).slice(2)
  async function storeActiveWindowMessage() {
    try {
      setStore('activeWindow', await activeWindow())
    } catch (e) {
      console.error(e)
      setStore('activeWindow:Error', String(e))
    }
  }
  // noinspection JSIgnoredPromiseFromCall
  storeActiveWindowMessage()
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    resizable: false,
    show: false,
    autoHideMenuBar: true,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  function calcBounds(display: Display) {
    return {
      ...display.bounds,
      y: -10,
      height: display.workAreaSize.height
    }
  }
  function showInMouseHoverDisplay() {
    // noinspection JSIgnoredPromiseFromCall
    storeActiveWindowMessage()
    const displays = screen.getAllDisplays()
    const mousePoint = screen.getCursorScreenPoint()
    const display = displays.find(display => {
      const { x, y, width, height } = display.bounds
      return x <= mousePoint.x && mousePoint.x <= x + width && y <= mousePoint.y && mousePoint.y <= y + height
    })
    if (!display) return
    mainWindow.setBounds(calcBounds(display))
    mainWindow.show()
    setStore('display', true, displayStoreUUID)
  }
  setStore('display', false, displayStoreUUID)
  const display = screen.getPrimaryDisplay()
  mainWindow.setBounds(calcBounds(display))

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  function toggleDisplay(b = !mainWindow.isVisible()) {
    if (b) {
      showInMouseHoverDisplay()
    } else {
      setStore('display', false, displayStoreUUID)
      setTimeout(() => {
        mainWindow.hide()
      }, 200)
    }
  }
  globalShortcut.register('command+space', () => toggleDisplay())
  lisStore('display', toggleDisplay, displayStoreUUID)
}

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

async function main() {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  await app.whenReady()
  // open external link in default browser
  const schema = 'spirit-oe'
  protocol.registerHttpProtocol(schema, request => {
    const url = request.url.substr(schema.length)
    shell.openExternal(`https${url}`)
  })
  app.dock.hide()
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  setStore('system', {
    os,
    username
  })
  createWindow()
  app.on('activate', function() {
    // On macOS, it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}
main()
  .catch(console.error)
