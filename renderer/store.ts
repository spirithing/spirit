import { createStore } from 'jotai'
import type { PrimitiveAtom } from 'jotai/vanilla/atom'
import type { Store } from 'spirit'

export type WithInitialValue<T> = { init: T }

export const electronStore = createStore()

export const keyAtom = <K extends keyof Store>(key: K) => atoms[key] as Atoms[K] | undefined

export const atoms = {} as {
  [K in keyof Store]: PrimitiveAtom<Store[K]> & WithInitialValue<Store[K]>
}
export type Atoms = typeof atoms
