export const withKeys = ['meta', 'ctrl', 'shift', 'alt'] as const
export type Shortcut = (typeof withKeys)[number] | (string & {})
export function isShortcut(e: KeyboardEvent, keys: Shortcut[]) {
  let rerefKeys = [...keys]
  for (const withKey of withKeys) {
    // when withKey in keys, check e[`${key}Key`] is true, else assert e[`${key}Key`] is false
    if (rerefKeys.includes(withKey)) {
      if (!e[`${withKey}Key`]) return false
      rerefKeys = rerefKeys.filter(key => key !== withKey)
    } else {
      if (e[`${withKey}Key`]) return false
    }
  }
  return rerefKeys.includes(e.key)
}
