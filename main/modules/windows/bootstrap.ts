import { app, BrowserWindow } from 'electron'

import { ee } from '../../lifecycle'
import { createConsoleWindow } from './consoleWindow'

ee.on('appReady', () => {
  createConsoleWindow()
  app.on('activate', () => {
    // On macOS, it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createConsoleWindow()
  })
})
