import { globalShortcut } from 'electron'
import type { Shortcuts } from 'spirit'

import { ee } from '../../lifecycle'
import { getStore, watch } from '../../store'
import { isWindows } from '../../utils/system'

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

ee.on('appReady', () => {
  const shortcutsUUID = Math.random().toString(36).slice(2)
  const accelerators: Record<string, string> = {}
  function registerGlobalShortcuts() {
    const globalShortcutKeys = [
      'start'
    ]
    const shortcuts = getStore('shortcuts') ?? {
      start: ['Alt', 'Space']
    }
    ;(Object.entries(shortcuts) as [keyof Shortcuts, string[]][])
      .forEach(([key, shortcut]) => {
        if (!globalShortcutKeys.includes(key)) return
        // https://www.electronjs.org/docs/latest/api/accelerator
        const accelerator = shortcut.map(k =>
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
        accelerators[key]
          && globalShortcut.unregister(accelerators[key])
        globalShortcut.register(accelerator, () => ee.emit('shortcut', key))
        accelerators[key] = accelerator
      })
  }
  registerGlobalShortcuts()
  watch('shortcuts', () => registerGlobalShortcuts(), shortcutsUUID)

  const bossAccelerator = isWindows
    ? 'Control+W'
    : 'Command+W'
  watch('display', value => {
    if (value) {
      globalShortcut.register(bossAccelerator, () => void 0)
    } else {
      globalShortcut.unregister(bossAccelerator)
    }
  }, 'temp')
})
