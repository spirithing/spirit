import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { app } from 'electron'

const userinfo = os.userInfo()

export const userDataPath = app.getPath('userData')
export const username = userinfo.username

export const getOrCreateUserSubDir = (subDir: string) => {
  const appPath = userDataPath
  if (!fs.existsSync(appPath)) {
    fs.mkdirSync(appPath)
  }
  const subDirPath = path.resolve(userDataPath, subDir)
  if (!fs.existsSync(subDirPath)) {
    fs.mkdirSync(subDirPath)
  }
  return subDirPath
}

const osType = os.type()
export const isWindows = osType === 'Windows_NT'
export const isMac = osType === 'Darwin'
export const isLinux = osType === 'Linux'
export { osType as os }
