import { atom } from 'jotai'
import type { Store } from 'spirit'

import { atoms, electronStore, keyAtom } from '../store'

export const keysAtom = atom(Object.keys(atoms))

export function subAtomByKey<
  K extends keyof Store,
>(
  id: K,
  callback: () => void,
  dispose = () => {}
) {
  const atom = keyAtom(id)
  let disposeSub: () => void
  if (atom) {
    disposeSub = electronStore.sub(atom, callback)
    dispose()
  } else {
    const dispose = electronStore.sub(keysAtom, () => {
      disposeSub = subAtomByKey(id, callback, dispose)
    })
  }
  return () => disposeSub?.()
}
