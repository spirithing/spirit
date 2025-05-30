import { atom } from 'jotai'
import type { ReactNode } from 'react'
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
  title: ReactNode
  keywords?: string[]
  group?: string
  placeholder?: ReactNode
  operations?: {
    type: 'icon' | 'text'
    value: string
    tooltip?: string
  }[]
  actions?: {
    enter?: [string, ...args: unknown[]]
    click?: [string, ...args: unknown[]]
    default?: [string, ...args: unknown[]]
  }
}

export const senderAtom = atom<
  {
    text: string
    send(text: string, assets?: Asset[]): void
  } | null
>(null)
