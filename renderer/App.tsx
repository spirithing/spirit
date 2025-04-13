import './App.scss'

import { useAtom } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useSelectionsOfApplications } from '#renderer/extensions/applications/selections.ts'
import { useSelectionsOfWechat } from '#renderer/extensions/im/wechat/selections.ts'

import favicon from '../resources/icon.png'
import type { SelectionGroup } from './atoms/sender'
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

const layouts = ['compact', 'default', 'more'] as const

function useLayoutZoom() {
  const [common, setCommon] = useElectronStore('common')
  const layout = (common?.layout ?? 'default') as typeof layouts[number]
  const zoom = (up: boolean) => {
    const index = layouts.indexOf(layout)
    const next = layouts[(index + (up ? 1 : -1) + layouts.length) % layouts.length]
    setCommon({ ...common!, layout: next })
  }
  useEventListener('keydown', e => {
    if (isShortcut(e, ['metaOrCtrl', '-'])) {
      zoom(false)
      e.stopPropagation()
      e.preventDefault()
      return
    }
    if (isShortcut(e, ['metaOrCtrl', '+'])) {
      zoom(true)
      e.stopPropagation()
      e.preventDefault()
      return
    }
  })
  return layout
}

export function App() {
  const { t } = useTranslation()
  useDisplay()
  const layout = useLayoutZoom()
  useEventListener('keydown', e => {
    if (isShortcut(e, ['meta', ','])) {
      senderRef.current?.toggleFooter()
      e.stopPropagation()
      e.preventDefault()
      return
    }
  })

  const [sender] = useAtom(senderAtom)
  const keyword = useMemo(() => sender?.text.toLowerCase().trim() ?? '', [sender?.text])

  const applicationSelections = useSelectionsOfApplications(keyword)
  const wechatSelections = useSelectionsOfWechat(keyword)

  const [, setSelectionsGroups] = useAtom(selectionsGroupsAtom)
  useEffect(() => {
    if (layout !== 'more' && !sender?.text.trim().length) {
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
      },
      {
        title: 'recent',
        selections: layout === 'more'
          ? [
            /* TODO record history actions */
          ]
          : []
      }
    ]
    setSelectionsGroups(selectionsGroups.filter(group => group.selections.length))
  }, [
    applicationSelections,
    layout,
    sender?.text,
    setSelectionsGroups,
    wechatSelections
  ])
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
        header={layout !== 'compact' && <Chatrooms />}
        footer={<Configurer />}
      />
      <Messages />
    </div>
  </>
}
