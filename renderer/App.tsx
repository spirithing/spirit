import './App.scss'

import { useAtom } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import favicon from '../resources/icon.png'
import type { Selection, SelectionGroup } from './atoms/sender'
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
  const applicationSelections = useMemo<Selection[]>(() => {
    const filtered = applications
      ?.filter(item => item.name.toLowerCase().includes(sender?.text.toLowerCase() ?? ''))
      ?? []
    return filtered.map(app => ({
      icon: app.icon
        ? { type: 'image', path: app.icon }
        : { type: 'icon', value: '🚀' },
      title: app.name.replace(/\.app$/, ''),
      enterAction: ['open', app.path],
      operations: [
        { type: 'text', value: 'Application' }
      ]
    }))
  }, [applications, sender?.text])
  const [wechats] = useElectronStore('wechats')
  const wechatSelections = useMemo<Selection[]>(() => {
    let keyword = sender?.text.toLowerCase() ?? ''
    if (keyword.startsWith('wc ')) {
      keyword = keyword.slice(3)
    }
    const filtered = wechats
      ?.filter(item => (
        item.title?.toLowerCase().includes(keyword)
        || item.subTitle?.toLowerCase().includes(keyword)
      ))
      ?? []
    return filtered.map(wechat => ({
      icon: wechat.icon?.path
        ? { type: 'image', path: `atom://${wechat.icon.path}` }
        : { type: 'icon', value: 'person' },
      title: wechat.title ?? 'Unknown',
      placeholder: wechat.title !== wechat.subTitle ? wechat.subTitle : undefined,
      enterAction: ['wechat', wechat.arg],
      operations: [
        { type: 'text', value: 'WeChat' }
      ]
    }))
  }, [sender?.text, wechats])
  const [, setSelectionsGroups] = useAtom(selectionsGroupsAtom)
  useEffect(() => {
    if (!sender?.text.trim().length) {
      setSelectionsGroups([])
      return
    }
    const defaultSelections = [
      ...applicationSelections,
      ...wechatSelections
    ]
    const selectionsGroups: SelectionGroup[] = [
      {
        title: 'default',
        selections: defaultSelections
      }
      // TODO display in full mode layout
      // {
      //   title: 'recent',
      //   selections: []
      // }
    ]
    setSelectionsGroups(selectionsGroups.filter(group => group.selections.length))
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
            {/* TODO message */}
          </>
        }
        header={<Chatrooms />}
        footer={<Configurer />}
      />
      <Messages />
    </div>
  </>
}
