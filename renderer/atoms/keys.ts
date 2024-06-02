import { atom } from 'jotai'
import type { Store } from 'spirit'

import { atoms, electronStore, keyAtom } from '../store'

export const keysAtom = atom(Object.keys(atoms))

export function subAtomByKey<
  K extends keyof Store,
>(
  id: K,
  callback: () => void
) {
  const atom = keyAtom(id)
  let disposeSub: () => void
  if (atom) {
    disposeSub = electronStore.sub(atom, callback)
  } else {
    disposeSub = electronStore.sub(keysAtom, () => {
      const atom = keyAtom(id)
      disposeSub()
      if (atom) {
        disposeSub = electronStore.sub(atom, callback)
      }
    })
  }
  return () => disposeSub?.()
}
