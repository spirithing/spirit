import './Sender.scss'
import '@shikitor/core/plugins/provide-completions.css'
import '@shikitor/core/plugins/provide-popup.css'
import '@shikitor/core/plugins/provide-selection-toolbox.css'

import provideCompletions from '@shikitor/core/plugins/provide-completions'
import providePopup from '@shikitor/core/plugins/provide-popup'
import provideSelectionToolbox from '@shikitor/core/plugins/provide-selection-toolbox'
import selectionToolboxForMd from '@shikitor/core/plugins/selection-toolbox-for-md'
import { Editor } from '@shikitor/react'
import { useState } from 'react'
import { DialogPlugin } from 'tdesign-react'

import favicon from '../../resources/icon.png'
import { useColor } from '../hooks/useColor'
import { useElectronStore } from '../store'

export interface SenderProps {
  onSend(text: string, dispatch: (text: string) => void): void
  onClear?(): void
}

const plugins = [
  providePopup,
  provideCompletions,
  provideSelectionToolbox,
  selectionToolboxForMd
]

export function Sender(props: SenderProps) {
  const prefix = 'spirit-sender'
  const {
    onSend,
    onClear
  } = props
  const [, setDisplay] = useElectronStore('display')
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
        theme: 'material-theme-darker',
        autoSize: { maxRows: 6 }
      }}
      plugins={plugins}
      onColorChange={setColor}
      onMounted={shikitor => {
        shikitor.focus()
      }}
      onKeydown={e => {
        if (e.key === 'Escape' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
          if (text) {
            const ins = DialogPlugin.confirm({
              header: 'Clear the input',
              body: 'Are you sure to clear the input?',
              onConfirm: () => {
                setText('')
                ins.hide()
              },
              onClose: () => ins.hide()
            })
          } else {
            setDisplay(false)
          }
        }
        if (e.key === 'k' && e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
          onClear?.()
        }
        if (e.key === 'Enter' && e.metaKey) {
          e.preventDefault()
          onSend(text, setText)
          return
        }
      }}
    />
  </div>
}
