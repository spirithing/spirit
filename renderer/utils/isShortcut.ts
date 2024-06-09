export const withKeys = ['meta', 'metaOrCtrl', 'ctrl', 'shift', 'alt'] as const
export type Shortcut = (typeof withKeys)[number] | (string & {})
function mappingMetaOrCtrl<T extends Shortcut>(key: T) {
  return key === 'metaOrCtrl'
    ? navigator.platform.includes('Mac')
      ? 'meta'
      : 'ctrl'
    : key
}
export function isShortcut(e: KeyboardEvent, keys: Shortcut[]) {
  const rerefKeys = [...keys].map(mappingMetaOrCtrl)
  for (let withKey of withKeys) {
    withKey = mappingMetaOrCtrl(withKey)
    // when withKey in keys, check e[`${key}Key`] is true, else assert e[`${key}Key`] is false
    if (rerefKeys.includes(withKey)) {
      if (!e[`${withKey}Key`]) return false
    } else {
      if (e[`${withKey}Key`]) return false
    }
  }
  return rerefKeys.includes(e.key)
}
