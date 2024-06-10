import * as fs from 'node:fs'
import * as path from 'node:path'

import { app } from 'electron'
import type { Application } from 'spirit'

import { isMac } from './system'

async function getApplicationsForDarwin(): Promise<Application[]> {
  const homePath = app.getPath('home')
  const userApplicationsPath = path.resolve(homePath, 'Applications')
  const userApplicationsDirs = await fs.promises.readdir(userApplicationsPath)
  const applicationsDirs = await fs.promises.readdir('/Applications')
  return userApplicationsDirs.map(name => ({
    name,
    path: path.resolve(userApplicationsPath, name)
  })).concat(
    applicationsDirs.map(name => ({
      name,
      path: path.resolve('/Applications', name)
    }))
  ).filter(({ name }) => name.endsWith('.app'))
}

export async function applications(): Promise<Application[]> {
  if (isMac) {
    return getApplicationsForDarwin()
  }
  return []
}
