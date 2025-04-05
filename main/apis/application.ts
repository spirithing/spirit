import { exec } from 'node:child_process'

import { isMac } from '../utils/system'
import { defineAPI } from './core/defineAPI'

export const openApplication = defineAPI('openApplication', async (path) => {
  if (isMac) {
    await new Promise<void>((ok, no) =>
      exec(
        `open -a "${path}" && osascript -e 'tell application "${path}" to activate'`,
        error => error ? no(error) : ok()
      )
    )
    return
  }
  throw new Error('Unsupported platform')
})
