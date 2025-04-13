import { is } from '@electron-toolkit/utils'
import type { Display } from 'electron'
import { app, BrowserWindow, screen, shell } from 'electron'
import { join } from 'path'

import icon from '../../../resources/icon.png?asset'
import { ee } from '../../lifecycle'
import { setStore, watch } from '../../store'

function calcBounds(display: Display) {
  return {
    ...display.bounds,
    y: display.bounds.y - 10,
    height: display.bounds.height + 20
  }
}

export function createConsoleWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: 'Spirit',
    resizable: false,
    show: false,
    autoHideMenuBar: true,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    enableLargerThanScreen: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      webSecurity: false,
      allowRunningInsecureContent: true,
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  // mainWindow.webContents.debugger.sendCommand()

  const displayStoreUUID = Math.random().toString(36).slice(2)
  async function showInMouseHoverDisplay() {
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
    ee.emit('consoleWindowShow')
  }
  function toggleDisplay(b = !mainWindow.isVisible()) {
    if (b) {
      showInMouseHoverDisplay()
    } else {
      setStore('display', false, displayStoreUUID)
      setTimeout(() => {
        mainWindow.hide()
        app.hide()
      }, 200)
    }
  }
  watch('display', toggleDisplay, displayStoreUUID)
  ee.on('shortcut', key => key === 'start' && toggleDisplay())

  setStore('display', false, displayStoreUUID)
  mainWindow.setBounds(calcBounds(screen.getPrimaryDisplay()))

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
