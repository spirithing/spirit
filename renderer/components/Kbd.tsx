import './Kbd.scss'

import type { CSSProperties } from 'react'

import { classnames } from '../utils/classnames'

type Key =
  | 'meta'
  | 'ctrl'
  | 'opt'
  | 'shift'
  | 'enter'
  | (string & {})

export type KbdProps = {
  className?: string
  noCard?: boolean
  style?: CSSProperties
  keys: Key[]
}

const isMac = typeof window !== 'undefined' && /Mac/.test(window.navigator.platform)
const META = !isMac ? 'Ctrl' : '⌘'
const CTRL = !isMac ? 'Ctrl' : '⌃'
const OPT = !isMac ? 'Alt' : '⌥'
const SHIFT = !isMac ? 'Shift' : '⇧'

const keyDisplayMapping = {
  meta: META,
  ctrl: CTRL,
  opt: OPT,
  shift: SHIFT,
  enter: '↵',
  left: '←',
  right: '→',
  up: '↑',
  down: '↓',
  arrowleft: '←',
  arrowright: '→',
  arrowup: '↑',
  arrowdown: '↓',
  escape: '⎋',
  delete: '⌦',
  backspace: '⌫',
  space: '␣',
  tab: '⇥',
  capslock: '⇪',
  pageup: '⇞',
  pagedown: '⇟',
  home: '↖',
  end: '↘',
  insert: 'Ins',
  contextmenu: '≣',
  numlock: '⇭',
  scrolllock: '⤓',
  pause: '⏸',
  printscreen: '⎙',
  help: '⍰',
  volumeup: '🔊',
  volumedown: '🔉',
  volumemute: '🔇',
  mediaplaypause: '⏯',
  mediastop: '⏹',
  mediaprevioustrack: '⏮',
  medianexttrack: '⏭',
  mediaseekbackward: '⏮⏮',
  mediaseekforward: '⏭⏭',
  mediaeject: '⏏',
  brightnessup: '🔆',
  brightnessdown: '🔅',
  keyboardlightup: '🔆',
  keyboardlightdown: '🔅',
  power: '⏻',
  poweroff: '⏻',
  sleep: '⏾',
  wake: '⏼',
  browsersearch: '🔍',
  browserhome: '🏠',
  browserback: '⇦',
  browserforward: '⇨',
  browserstop: '⏹',
  browserrefresh: '↻',
  browserfavorites: '🌟',
  zoomin: '🔍+',
  zoomout: '🔍-',
  zoomreset: '🔍0',
  zoomextend: '🔍⇧',
  find: '🔍',
  numpadclear: '⌧',
  numpaddivide: '÷',
  numpadmultiply: '×',
  numpadsubtract: '−',
  numpadadd: '+',
  numpadenter: '↵',
  numpadequal: '=',
  numpaddecimal: '.',
  numpad0: '0',
  numpad1: '1',
  numpad2: '2',
  numpad3: '3',
  numpad4: '4',
  numpad5: '5',
  numpad6: '6',
  numpad7: '7',
  numpad8: '8',
  numpad9: '9',
  bracketleft: '[',
  bracketright: ']',
  semicolon: ';',
  quote: "'",
  comma: ',',
  period: '.',
  slash: '/',
  backslash: '\\',
  backquote: '`',
  minus: '-',
  equal: '=',
  intlbackslash: '§',
  intlro: 'ろ',
  introya: 'や',
  intlhenkan: '変',
  intlkatakana: 'カ',
  intlkatakanahiragana: 'カひ',
  intlkatakanahalfwidth: 'ｶ',
  intlmuhenkan: '無',
  intlyen: '¥',
  intlcomma: '、',
  intlperiod: '。',
  intlro2: 'ろ',
  intlzenkakuhankaku: '▽',
  intlatmark: '@',
  intlcolon: ':',
  intlcircumflex: '^',
  intlatilde: '~',
  intlgrave: '`',
  intlunderscore: '_',
  intlcomma2: '，',
  intlperiod2: '．',
  intlslash: '／',
  intlbackslash2: '＼',
  intlsemicolon: '；',
  intlquote: '＇',
  intlbracketleft: '［',
  intlbracketright: '］',
  intlbackquote: '‘',
  intlminus: '－',
  intlequal: '＝'
}

export function Kbd(props: KbdProps) {
  return <kbd
    className={classnames(
      `${'spirit'}-kbd`,
      {
        [`${'spirit'}-kbd--no-card`]: props.noCard
      }
    )}
    {...props}
  >
    {props.keys.map(key => (
      <span
        key={key}
        className={classnames(`${'spirit'}-kbd-key`, key)}
        title={key}
      >
        {keyDisplayMapping[key.toLowerCase()] || key.replace(/^Key/, '')}
      </span>
    ))}
  </kbd>
}
