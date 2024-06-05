import './KbdRecorder.scss'

import { CSSProperties, useEffect } from 'react'
import { useRef, useState } from 'react'
import { Button } from 'tdesign-react'
import useControlled from 'tdesign-react/es/hooks/useControlled'

import { classnames } from '../utils/classnames'
import { Kbd } from './Kbd'

export interface KbdRecorderProps {
  style?: CSSProperties
  className?: string
  value?: string[]
  defaultValue?: string[]
  onChange?: (value?: string[]) => void
}

export function KbdRecorder(props: KbdRecorderProps) {
  const { prefix } = KbdRecorder
  const { className, style } = props
  const [recording, setRecording] = useState(false)
  const [keys, setKeys] = useControlled(props, 'value', props.onChange!)
  useEffect(() => {
    if (!recording) return
  }, [recording])

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
        onClick={() => setRecording(!recording)}
        onBlur={() => setRecording(false)}
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
      <Button
        size='small'
        variant='text'
        shape='circle'
        onClick={() => setKeys([])}
      >
        <span className='s-icon'>cancel</span>
      </Button>
    </div>
  </div>
}

KbdRecorder.prefix = `${'spirit'}-kbd-recorder`
