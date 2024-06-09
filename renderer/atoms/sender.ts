import { atom } from 'jotai'
import type { Asset } from 'spirit'

export const senderAtom = atom<
  {
    text: string
    send(text: string, assets?: Asset[]): void
  } | null
>(null)
