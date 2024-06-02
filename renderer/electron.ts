// noinspection TypeScriptUnresolvedReference

const MAX_IPC_CALLS = 100

let count = 0
const i = setInterval(() => count = 0, 100)
if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => clearInterval(i))
}

export const ipcRenderer = new Proxy(electron.ipcRenderer, {
  get(target, prop) {
    const field = Reflect.get(target, prop)
    if (typeof prop === 'string' && typeof field === 'function') {
      return (...args: unknown[]) => {
        if (count > MAX_IPC_CALLS) {
          throw new Error('IPC call loop detected')
        }
        count++
        return field(...args)
      }
    } else {
      return field
    }
  }
})
export const webFrame = electron.webFrame
export const process = electron.process
