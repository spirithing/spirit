import './Sender.scss'

import { Editor } from '@shikitor/react'
import { useState } from 'react'

import favicon from '../../resources/icon.png'
import { useColor } from '../hooks/useColor'

export interface SenderProps {
  onSend(text: string, dispatch: (text: string) => void): void
}

export function Sender(props: SenderProps) {
  const {
    onSend
  } = props
  const [text, setText] = useState('')
  const { setColor } = useColor(() => {}, [])
  return <div className='spirit-sender'>
    <img src={favicon} width={20} className='spirit-sender__icon' />
    <Editor
      value={text}
      onChange={setText}
      defaultOptions={{
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
