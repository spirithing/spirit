import './KbdRecorder.scss'

import type { CSSProperties } from 'react'
import { useCallback, useRef, useState } from 'react'
import { Button } from 'tdesign-react'
import useControlled from 'tdesign-react/es/hooks/useControlled'

import { useEventCallback } from '../hooks/useEventCallback'
import { classnames } from '../utils/classnames'
import { Kbd } from './Kbd'

export interface KbdRecorderProps {
  style?: CSSProperties
  className?: string
  clearable?: boolean
  resettable?: boolean
  value?: string[]
  defaultValue?: string[]
  onChange?: (value?: string[]) => void
  onRecordStart?: () => void
  onRecordEnd?: () => void
}

export function KbdRecorder(props: KbdRecorderProps) {
  const { prefix } = KbdRecorder
  const {
    className,
    style,
    clearable,
    resettable,
    onRecordStart,
    onRecordEnd
  } = props
  const [keys, setKeys] = useControlled(props, 'value', props.onChange!)
  const recordStart = useEventCallback(onRecordStart)
  const recordEnd = useEventCallback(onRecordEnd)

  const [recording, setRecording] = useState(false)
  const keysBeforeRecording = useRef(keys)
  const toggleRecording = useCallback((must?: boolean) => {
    const next = must ?? !recording
    setRecording(next)
    if (next) {
      keysBeforeRecording.current = keys
      recordStart?.()
    } else {
      recordEnd?.()
    }
    if (must === false) {
      if (keys && ['meta', 'ctrl', 'opt', 'shift'].includes(keys[keys.length - 1])) {
        setKeys(keysBeforeRecording.current)
      }
    }
  }, [keys, recordStart, recordEnd, recording, setKeys])

  const recordRef = useRef<HTMLElement>(null)
  return <div
    style={style}
    className={classnames(prefix, className)}
  >
    <Kbd keys={keys ?? []} />
    <div className={`${prefix}__opts`}>
      <Button
        ref={recordRef}
        size='small'
        variant='text'
        shape='circle'
        theme='danger'
        onClick={() => toggleRecording()}
        onBlur={() => toggleRecording(false)}
        onKeyDown={e => {
          if (!recording) return

          e.stopPropagation()
          e.preventDefault()
          setKeys([
            e.metaKey && 'meta',
            e.ctrlKey && 'ctrl',
            e.altKey && 'opt',
            e.shiftKey && 'shift',
            !['Meta', 'Control', 'Alt', 'Shift'].includes(e.key) && e.key
          ].filter(<T,>(x: T | false): x is T => Boolean(x)) as string[])
        }}
      >
        {recording
          ? <span className='s-icon'>radio_button_checked</span>
          : <span className='s-icon'>radio_button_unchecked</span>}
      </Button>
      {clearable && <Button
        size='small'
        variant='text'
        shape='circle'
        onClick={() => setKeys([])}
      >
        <span className='s-icon'>cancel</span>
      </Button>}
      {resettable && props.defaultValue && props.defaultValue.length > 0 && <Button
        size='small'
        variant='text'
        shape='circle'
        disabled={keys?.every((key, index) => key === props.defaultValue![index])}
        onClick={() => setKeys(props.defaultValue)}
      >
        <span className='s-icon'>reset_wrench</span>
      </Button>}
    </div>
  </div>
}

KbdRecorder.prefix = `${'spirit'}-kbd-recorder`
