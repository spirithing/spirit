import './Sender.scss'

import { Editor } from '@shikitor/react'
import { useState } from 'react'

import favicon from '../../resources/icon.png'
import { useColor } from '../hooks/useColor'

export interface SenderProps {
  onSend(text: string, dispatch: (text: string) => void): void
}

export function Sender(props: SenderProps) {
  const prefix = 'spirit-sender'
  const {
    onSend
  } = props
  const [text, setText] = useState('')
  const { setColor } = useColor(() => {}, [])
  return <div className={prefix}>
    <div className={`${prefix}__prefix`}>
      <img className={`${prefix}__icon`} src={favicon} />
    </div>
    <Editor
      value={text}
      onChange={setText}
      defaultOptions={{
        language: 'markdown',
        lineNumbers: 'off',
        theme: 'material-theme-darker'
      }}
      onColorChange={setColor}
      onMounted={shikitor => {
        shikitor.focus()
      }}
      onKeydown={e => {
        if (e.key === 'Enter' && e.metaKey) {
          e.preventDefault()
          onSend(text, setText)
          return
        }
      }}
    />
  </div>
}
