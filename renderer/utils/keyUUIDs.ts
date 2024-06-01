import type { Store } from 'spirit'

const uuids = new Map<string, string>()

export function keyUUID(key: keyof Store): string | undefined
export function keyUUID(key: keyof Store, withDefault: true): string
export function keyUUID(key: keyof Store, withDefault?: true) {
  let uuid = uuids.get(key)
  if (!withDefault) return uuid
  uuid = Math.random().toString(36).slice(2)
  uuids.set(key, uuid)
  return uuid
}
