import './store'
import './bridge'
import './modules/shortcut/bootstrap'
import './modules/system/bootstrap'
import './modules/windows/bootstrap'

// TODO listen language change by os-locale
import { app } from 'electron'

import { ee } from './lifecycle'

ee.emit('processStart')

async function main() {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  await app.whenReady()
  ee.emit('appReady')
}
main()
  .catch(console.error)

process.on('unhandledRejection', reason => {
  console.error(reason)
})
