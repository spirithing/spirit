import { is, platform } from '@electron-toolkit/utils'
import type { Display } from 'electron'
import { BrowserWindow, screen, shell } from 'electron'
import { join } from 'path'

import icon from '../../../resources/icon.png?asset'
import { ee } from '../../lifecycle'
import { setStore, watch } from '../../store'

function getMouseHoverDisplay() {
  const displays = screen.getAllDisplays()
  const mousePoint = screen.getCursorScreenPoint()
  return displays.find(display => {
    const { x, y, width, height } = display.bounds
    return x <= mousePoint.x && mousePoint.x <= x + width && y <= mousePoint.y && mousePoint.y <= y + height
  })!
}

function calcBounds(display: Display) {
  return {
    ...display.bounds,
    y: display.bounds.y - 10,
    height: display.bounds.height + 20
  }
}

export async function createConsoleWindow() {
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
      devTools: is.dev,
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

  const displayStoreUUID = Math.random().toString(36).slice(2)
  const setDisplay = (display: boolean) => {
    setStore('display', display, displayStoreUUID)
  }
  let isShowing = false
  function toggleDisplay(b = !mainWindow.isVisible()) {
    if (b === isShowing) return

    if (b) {
      mainWindow.setBounds(calcBounds(getMouseHoverDisplay()))
      mainWindow.show()
      setDisplay(true)
      ee.emit('consoleWindowShow')
      isShowing = true
    } else {
      setDisplay(false)
      setTimeout(() => {
        if (!isShowing) {
          return
        }
        isShowing = false
        mainWindow.hide()
      }, 200)
    }
  }
  mainWindow.setBounds(calcBounds(getMouseHoverDisplay()))
  setDisplay(false)

  ee.on('shortcut', key => key === 'start' && toggleDisplay())
  watch('display', value => {
    toggleDisplay(value)
  }, displayStoreUUID)

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && import.meta.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(import.meta.env.ELECTRON_RENDERER_URL)
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  if (is.dev) {
    const { webContents } = mainWindow
    await new Promise<void>(ok => webContents.on('did-finish-load', ok))
    webContents.openDevTools({
      mode: 'undocked',
      activate: JSON.parse(import.meta.env.VITE_MAIN_AUTO_OPEN_DEV_TOOLS ?? 'false')
    })
    mainWindow.webContents.on('before-input-event', (_, e) => {
      const withMeta = platform.isMacOS
        ? e.meta
        : e.control

      if (e.key === 'c' && e.shift && withMeta) {
        webContents.devToolsWebContents?.sendInputEvent({
          type: 'keyDown',
          modifiers: [
            platform.isMacOS
              ? 'meta'
              : 'control',
            'shift'
          ],
          keyCode: 'C'
        })
      }
    })
  }
}
