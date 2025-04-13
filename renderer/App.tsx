import './App.scss'

import { useAtom } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useSelectionsGroupsForApp } from '#renderer/extensions/applications/selectionsGroups.tsx'
import { useSelectionsForWechat } from '#renderer/extensions/im/wechat/selectionsGroups.ts'

import favicon from '../resources/icon.png'
import type { Selection, SelectionsGroup } from './atoms/sender'
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

  const selsGroupsForApp = useSelectionsGroupsForApp(keyword)
  const selsGroupsForWechat = useSelectionsForWechat(keyword)

  const [, setSelectionsGroups] = useAtom(selectionsGroupsAtom)
  useEffect(() => {
    if (layout !== 'more' && !sender?.text.trim().length) {
      setSelectionsGroups([])
      return
    }
    const selectionsMap: Record<string, Selection[]> = {
      result: [],
      default: [],
      recent: [],
      suggestion: [],
      commander: []
    }
    const restSelectionsGroups: SelectionsGroup[] = []
    selsGroupsForApp.forEach(group => {
      const selections = selectionsMap[group.title]
      if (selections) {
        selections.push(...group.selections)
      } else {
        restSelectionsGroups.push(group)
      }
    })
    const defaultOrder = [
      'default',
      'result',
      'recent',
      'suggestion',
      'commander'
    ]
    const selectionsGroups: SelectionsGroup[] = []
    defaultOrder.forEach(title => {
      const selections = selectionsMap[title]
      if (selections) {
        selectionsGroups.push({
          title,
          order: defaultOrder.indexOf(title),
          selections
        })
        delete selectionsMap[title]
      }
    })
    selectionsGroups.push(...restSelectionsGroups)
    setSelectionsGroups(
      selectionsGroups
        .sort((a, b) => {
          if (a.order === undefined && b.order === undefined) return 0
          return (a.order ?? 0) - (b.order ?? 0)
        })
        .filter(group => group.selections.length)
    )
  }, [
    selsGroupsForApp,
    layout,
    sender?.text,
    setSelectionsGroups,
    selsGroupsForWechat
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
