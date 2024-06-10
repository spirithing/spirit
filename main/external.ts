import { exec } from 'node:child_process'

import { ipcMain } from 'electron'

import { isMac } from './utils/system'

ipcMain.on('open', (_, path) => {
  if (isMac) {
    exec(`open -a "${path}" && osascript -e 'tell application "${path}" to activate'`, error => {
      if (error) {
        console.error(error)
      }
    })
    return
  }
})
