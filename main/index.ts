import './store'
import './external'

import * as url from 'node:url'

// TODO listen language change by os-locale
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, clipboard, type Display, globalShortcut, protocol, screen, shell } from 'electron'
import { activeWindow } from 'get-windows'
import { join } from 'path'
import type { WeChat } from 'spirit'

import icon from '../resources/icon.png?asset'
import { getStore, setStore, watch } from './store'
import { applications } from './utils/applications'
import getIcon from './utils/getIcon'
import { isWindows, os, username } from './utils/system'

const VARIOUS_PUNCTUATION = {
  // ), !, @, #, $, %, ^, &, *, (, :, ;, :, +, =, <, ,, _, -, >, ., ?, /, ~, `, {, ], [, |, \, }, "
  bracketleft: '[',
  bracketright: ']',
  semicolon: ';',
  quote: "'",
  comma: ',',
  period: '.',
  slash: '/',
  backslash: '\\',
  backquote: '`',
  minus: '-',
  equal: '='
}

async function storeActiveWindowMessage() {
  try {
    setStore('activeWindow', await activeWindow())
    setStore('activeWindow:Error', undefined)
  } catch (e) {
    console.error(e)
    setStore('activeWindow:Error', String(e))
  }
}

function refreshStoreWhenOpen() {
  applications().then(async applications => {
    setStore('applications', applications)
    setStore(
      'applications',
      await Promise.all(applications.map(async app => {
        return app.icon
          ? app
          : { ...app, icon: await getIcon(app.path) }
      }))
    )
  })
  fetch('http://localhost:48065/wechat/search').then(res =>
    res.json() as unknown as {
      items: WeChat[]
    }
  ).then(({ items }) => setStore('wechats', items))
}

function createWindow() {
  const displayStoreUUID = Math.random().toString(36).slice(2)
  setTimeout(function loop() {
    storeActiveWindowMessage()
      .then(() => setTimeout(loop, 3000))
  }, 0)
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
  function calcBounds(display: Display) {
    return {
      ...display.bounds,
      y: display.bounds.y - 10,
      height: display.bounds.height + 20
    }
  }
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
      refreshStoreWhenOpen()
    } else {
      setStore('display', false, displayStoreUUID)
      setTimeout(() => {
        mainWindow.hide()
        app.hide()
      }, 200)
    }
  }
  const shortcutsUUID = Math.random().toString(36).slice(2)
  let accelerators: Record<string, string> = {}
  function addGlobalShortcuts() {
    const { start } = getStore('shortcuts') ?? {
      start: ['Alt', 'Space']
    }
    // https://www.electronjs.org/docs/latest/api/accelerator
    const startAccelerator = start.map(k =>
      ({
        ...VARIOUS_PUNCTUATION,
        opt: 'Alt',
        meta: 'Command',
        ctrl: 'Control',
        shift: 'Shift'
      })[k.toLowerCase()] ?? (
        k
          .replace(/^Numpad/, 'Num')
          .replace(/Decimal$/, 'Dec')
          .replace(/Multiply$/, 'Mult')
          .replace(/Add$/, 'Add')
          .replace(/Subtract$/, 'Sub')
          .replace(/Divide$/, 'Div')
          .replace(/^Arrow/, '')
          .replace(/^Key/, '')
      )
    ).join('+')
    accelerators.start
      && globalShortcut.unregister(accelerators.start)
    globalShortcut.register(startAccelerator, () => toggleDisplay())
    return {
      start: startAccelerator
    }
  }
  accelerators = addGlobalShortcuts()
  watch('shortcuts', () => {
    accelerators = addGlobalShortcuts()
  }, shortcutsUUID)
  const bossAccelerator = isWindows
    ? 'Control+W'
    : 'Command+W'
  watch('display', () => {
    const display = getStore('display')
    if (display) {
      const ret = globalShortcut.register(bossAccelerator, () => {
        // TODO send message to renderer
      })
      if (!ret) {
        // TODO store shortcut register error message
      }
    } else {
      globalShortcut.unregister(bossAccelerator)
    }
  }, 'temp')
  watch('display', toggleDisplay, displayStoreUUID)
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

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

async function main() {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  await app.whenReady()
  const clipboardFormats = ['Text', 'HTML', 'RTF', 'Image', 'Bookmark']
  clipboardFormats.forEach(format => {
    console.log(format, clipboard[`read${format}`]('selection'))
  })
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
