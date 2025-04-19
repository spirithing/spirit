import { subAtomByKey } from '../atoms/keys'
import { electronStore, keyAtom } from '../store'

subAtomByKey('theme', () => {
  const themeStore = electronStore.get(keyAtom('theme')!)
  const { colors } = themeStore ?? {}
  if (colors) {
    if (colors.primary) {
      if (!Array.isArray(colors.primary)) {
        document.body.style.setProperty('--td-brand-color', colors.primary)
      } else {
        // TODO
      }
    }
  }
})
