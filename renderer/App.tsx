import './App.scss'

import { useAtom } from 'jotai'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import favicon from '../resources/icon.png'
import { selectionsGroupsAtom, senderAtom } from './atoms/sender'
import { Configurer } from './components/Configurer'
import { Kbd } from './components/Kbd'
import type { SenderContext } from './components/Sender'
import { Sender } from './components/Sender'
import { Chatrooms } from './extensions/chatroom/Chatrooms'
import { Messages } from './extensions/chatroom/Messages'
import { useEventListener } from './hooks/useEventListener'
import { useElectronStore } from './hooks/useStore'
import { isShortcut } from './utils/isShortcut'

function useDisplay() {
  const [display] = useElectronStore('display')
  useEffect(() => {
    document.body.classList.toggle('displaying', !!display)
    return () => {
      document.body.classList.remove('displaying')
    }
  }, [display])
}

export function App() {
  const { t } = useTranslation()
  useDisplay()
  useEventListener('keydown', e => {
    if (isShortcut(e, ['meta', ','])) {
      senderRef.current?.toggleFooter()
      e.preventDefault()
    }
  })

  const [sender] = useAtom(senderAtom)
  const [, setSelectionsGroups] = useAtom(selectionsGroupsAtom)
  useEffect(() => {
    // if (!sender?.text.trim().length) {
    //   setSelectionsGroups([])
    //   return
    // }
    setSelectionsGroups([
      {
        title: 'default',
        selections: [
          {
            icon: { type: 'icon', value: '👋' },
            title: 'Item0',
            operations: [
              { type: 'text', value: 'Command' }
            ]
          }
        ]
      },
      {
        title: 'recent',
        selections: [
          {
            icon: { type: 'icon', value: '👋' },
            title: 'Item1',
            placeholder: 'Placeholder',
            operations: [
              { type: 'text', value: 'Command' }
            ]
          }
        ]
      }
    ])
  }, [sender?.text, setSelectionsGroups])
  const senderRef = useRef<SenderContext>(null)
  return <>
    <div className='spirit-main'>
      <Sender
        ref={senderRef}
        icon={
          <img
            alt='icon'
            src={favicon}
            width={28}
          />
        }
        iconTooltip={
          <>
            {t('Display configure panel')}
            <br />
            <Kbd keys={['meta', ',']} />
          </>
        }
        onIconClick={ctx => ctx.toggleFooter()}
        message={
          <>
            This is a status bar...
          </>
        }
        header={<Chatrooms />}
        footer={<Configurer />}
      />
      <Messages />
    </div>
  </>
}
