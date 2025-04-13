import { exec } from 'node:child_process'

import type { Application } from 'spirit'

import { isMac } from './system'

async function getApplicationsForDarwin(): Promise<Application[]> {
  const apps = await new Promise<{
    _name: string
    path: string
    info?: string
    version?: string
    lastModified: string
  }[]>((ok, no) => {
    exec(`system_profiler SPApplicationsDataType -json`, { encoding: 'utf-8' }, (error, stdout) => {
      if (error) {
        no(error)
        return
      }
      try {
        ok(JSON.parse(stdout).SPApplicationsDataType)
      } catch (e) {
        no(e)
      }
    })
  })
  return apps
    .filter(app => app.path && app.path.endsWith('.app'))
    .map(({ _name: name, ...app }) => ({ name, ...app }))
}

export async function applications(): Promise<Application[]> {
  if (isMac) {
    return getApplicationsForDarwin()
  }
  return []
}
