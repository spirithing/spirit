import { createStore } from 'jotai'
import type { PrimitiveAtom } from 'jotai/vanilla/atom'
import type { Store } from 'spirit'

export type WithInitialValue<T> = { init: T }

export const electronStore = createStore()

export function getFromStore<A>(atom: PrimitiveAtom<A>): A
export function getFromStore<K extends keyof Store>(key: K): Store[K]
export function getFromStore(keyOrAtom: any) {
  let atom: PrimitiveAtom<any> | undefined
  if (typeof keyOrAtom === 'string') {
    atom = keyAtom(keyOrAtom as keyof Store)
    if (!atom) {
      throw new Error(`${keyOrAtom} not initialized`)
    }
  } else {
    atom = keyOrAtom
  }
  return electronStore.get(atom!)
}
export function getThrowWhenUndefined<A>(atom: PrimitiveAtom<A>): NonNullable<A>
export function getThrowWhenUndefined<K extends keyof Store>(key: K): NonNullable<Store[K]>
export function getThrowWhenUndefined(key: any) {
  const value = getFromStore(key)
  if (value === undefined || value === null) {
    throw new Error(`${key} not initialized`)
  }
  return value
}

export const keyAtom = <K extends keyof Store>(key: K) => atoms[key] as Atoms[K] | undefined

export const atoms = {} as {
  [K in keyof Store]: PrimitiveAtom<Store[K]> & WithInitialValue<Store[K]>
}
export type Atoms = typeof atoms
