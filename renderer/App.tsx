import './App.scss'

import { useAtom } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import favicon from '../resources/icon.png'
import type { Selection } from './atoms/sender'
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
  const [applications] = useElectronStore('applications')
  const applicationSelections = useMemo<Selection[]>(() =>
    applications
      ?.filter(item => item.name.toLowerCase().includes(sender?.text.toLowerCase() ?? ''))
      ?.map(app => ({
        icon: app.icon
          ? { type: 'image', path: app.icon }
          : { type: 'icon', value: '🚀' },
        title: app.name.replace(/\.app$/, ''),
        operations: [
          { type: 'text', value: 'Application' }
        ]
      }))
      ?? [], [applications, sender?.text])
  const [, setSelectionsGroups] = useAtom(selectionsGroupsAtom)
  useEffect(() => {
    if (!sender?.text.trim().length) {
      setSelectionsGroups([])
      return
    }
    setSelectionsGroups([
      {
        title: 'default',
        selections: [
          ...applicationSelections
        ]
      },
      {
        title: 'recent',
        selections: []
      }
    ])
  }, [applicationSelections, sender?.text, setSelectionsGroups])
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
