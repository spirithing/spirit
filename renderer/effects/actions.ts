import { ipcRenderer } from '../electron'
import { ee } from '../instances/ee'
import { electronStore, keyAtom } from '../store'

ee.on('act', (type, ...args) => {
  if (type === 'open') {
    const [path] = args
    ipcRenderer.send('open', path)
    electronStore.set(keyAtom('display')!, false)
  }
})
