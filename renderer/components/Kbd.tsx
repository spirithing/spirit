import './Kbd.scss'

import type { CSSProperties } from 'react'

import { classnames } from '../utils/classnames'

type Key =
  | 'meta'
  | 'opt'
  | 'enter'
  | (string & {})

export type KbdProps = {
  className?: string
  style?: CSSProperties
  keys: Key[]
}

const isMac = typeof window !== 'undefined' && /Mac/.test(window.navigator.platform)
const META = !isMac ? 'Ctrl' : '⌘'
const OPT = !isMac ? 'Alt' : '⌥'
const SHIFT = !isMac ? 'Shift' : '⇧'

export function Kbd(props: KbdProps) {
  return <kbd className={`${'spirit'}-kbd`} {...props}>
    {props.keys.map((key, index) => (
      <span key={index} className={classnames(`${'spirit'}-kbd-key`, key)}>
        {{
          meta: META,
          opt: OPT,
          shift: SHIFT,
          enter: '↵'
        }[key as string] || key.toUpperCase() as string}
      </span>
    ))}
  </kbd>
}
