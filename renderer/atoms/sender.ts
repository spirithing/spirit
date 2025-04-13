import { atom } from 'jotai'
import type { Asset } from 'spirit'

export type SelectionsGroup = {
  title: string
  order?: number
  operations?: {
    type: 'icon' | 'text'
    value: string
    tooltip?: string
  }[]
  selections: Selection[]
}

export const selectionsGroupsAtom = atom<SelectionsGroup[]>([
  {
    title: 'default',
    selections: []
  }
])

export type Selection = {
  icon:
    | { type: 'icon'; value: string }
    | { type: 'image'; path: string }
  title: string
  group?: string
  placeholder?: string
  operations?: {
    type: 'icon' | 'text'
    value: string
    tooltip?: string
  }[]
  enterAction?: string | [string, ...args: unknown[]]
  clickAction?: string | [string, ...args: unknown[]]
}

export const senderAtom = atom<
  {
    text: string
    send(text: string, assets?: Asset[]): void
  } | null
>(null)
