/* eslint-disable no-extra-semi */
import './Sender.scss'
import '@shikitor/core/plugins/provide-completions.css'
import '@shikitor/core/plugins/provide-popup.css'
import '@shikitor/core/plugins/provide-selection-toolbox.css'

import type { Shikitor } from '@shikitor/core'
import provideCompletions from '@shikitor/core/plugins/provide-completions'
import providePopup from '@shikitor/core/plugins/provide-popup'
import provideSelectionToolbox from '@shikitor/core/plugins/provide-selection-toolbox'
import selectionToolboxForMd from '@shikitor/core/plugins/selection-toolbox-for-md'
import { Editor } from '@shikitor/react'
import { useDebouncedValue } from 'foxact/use-debounced-value'
import type { ForwardedRef, ReactNode } from 'react'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Asset } from 'spirit'
import { Button, Image, ImageViewer, Tooltip } from 'tdesign-react'

import { useChatroom } from '../hooks/useChatroom'
import { useColor } from '../hooks/useColor'
import { useCtxCallback } from '../hooks/useCtxCallback'
import { useEventListener } from '../hooks/useEventListener'
import { useElectronStore } from '../hooks/useStore'
import { useHighlightTheme } from '../providers/theme'
import chatroomCompletions from '../shikitor-plugins/chatroom-completions'
import { electronStore, keyAtom } from '../store'
import { classnames } from '../utils/classnames'
import { imgBlob2base64 } from '../utils/imgBlob2base64'
import { isShortcut } from '../utils/isShortcut'
import { Kbd } from './Kbd'

const useYiyanPlaceholder = () => {
  const { t } = useTranslation()
  const yiyan = useMemo(() => [
    // TODO
    '来聊点什么？',
    '人生没有彩排，每天都是现场直播。',
    '人生不如意十之八九，剩下的一二分，也未必如意。',
    '人生就是起起落落，落落又起起。',
    '机器人的人生也不容易，每天充电，还要听人吹牛。',
    '这是由 AI 生成的一句话。'
  ], [t])
  const [yiyanIndex, setYiyanIndex] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setYiyanIndex(i => (i + 1) % yiyan.length)
    }, 30000)
    return () => clearInterval(timer)
  }, [])
  return useMemo(() => yiyan[yiyanIndex], [yiyanIndex])
}

const plugins = [
  providePopup,
  provideCompletions({
    popupPlacement: 'bottom',
    footer: false
  }),
  provideSelectionToolbox,
  selectionToolboxForMd,
  chatroomCompletions({
    get chatrooms() {
      const chatroomsAtom = keyAtom('chatrooms')
      if (!chatroomsAtom) return []
      const chatrooms = electronStore.get(chatroomsAtom)
      return chatrooms?.map(id => ({
        id,
        name: id
      })) ?? [
        { id: 'default', name: 'Default' }
      ]
    }
  })
]

const useSenderCtx = () => {
  const [visibles, setVisibles] = useState({
    header: true,
    footer: false
  })
  const visiblesRef = useRef(visibles)
  visiblesRef.current = visibles
  return useRef<SenderContext>({
    get visibles() {
      return visiblesRef.current
    },
    toggleHeader: () => setVisibles(v => ({ ...v, header: !v.header })),
    toggleFooter: () => setVisibles(v => ({ ...v, footer: !v.footer }))
  })
}

export interface SenderContext {
  readonly visibles: {
    readonly header: boolean
    readonly footer: boolean
  }
  toggleHeader(): void
  toggleFooter(): void
}

export interface SenderProps {
  className?: string
  icon?: ReactNode
  iconTooltip?: ReactNode
  message?: ReactNode
  header?: ReactNode
  footer?: ReactNode
  onIconClick(this: SenderContext, ctx: SenderContext): void
}

function Sender(props: SenderProps, ref: ForwardedRef<SenderContext>) {
  const { prefix } = Sender
  const ctxRef = useSenderCtx()
  useImperativeHandle(ref, () => ctxRef.current, [ctxRef])
  const {
    visibles
  } = ctxRef.current
  const debouncedVisibles = useDebouncedValue(visibles, 300)
  const memoDebouncedVisibles = useMemo(() => ({
    header: visibles.header
      ? visibles.header
      : debouncedVisibles.header,
    footer: visibles.footer
      ? visibles.footer
      : debouncedVisibles.footer
  }), [debouncedVisibles.footer, debouncedVisibles.header, visibles.footer, visibles.header])
  const {
    className,
    icon,
    iconTooltip,
    onIconClick,
    message
  } = props
  const clickIcon = useCtxCallback(ctxRef, onIconClick)

  const [, { sendMessage }] = useChatroom()

  const placeholder = useYiyanPlaceholder()

  const [display, setDisplay] = useElectronStore('display')
  const [text, setText] = useState('')
  const shikitorRef = useRef<Shikitor>(null)
  useEffect(() => {
    if (display) {
      shikitorRef.current?.focus()
    }
  }, [display])

  const { setColor } = useColor(() => {}, [])

  const highlightTheme = useHighlightTheme()

  const senderBgRef = useRef<HTMLDivElement>(null)
  const senderRef = useRef<HTMLDivElement>(null)
  const sync = useCallback(async (type: string, disposedRef: { current: boolean }) => {
    const sender = senderRef.current
    const senderBg = senderBgRef.current
    if (!sender || !senderBg) return

    const isInited = senderBg.dataset.inited === '1'
    if (!isInited && type !== 'init') return
    await new Promise(resolve =>
      setTimeout(
        resolve,
        {
          init: 0,
          resize: 200,
          display: 200,
          observer: 0
        }[type]
      )
    )
    if (disposedRef.current) return
    const { x, y, width, height } = sender.getBoundingClientRect()
    console.debug('sync', { type }, x, y, width, height)
    if (['init', 'display', 'resize'].includes(type)) {
      senderBg.style.setProperty('--st', y + 'px')
      senderBg.style.setProperty('--sl', x + 'px')
    }
    if (['init', 'display', 'observer'].includes(type)) {
      senderBg.style.setProperty('--sw', width + 'px')
      senderBg.style.setProperty('--sh', height + 'px')
    }
    if (!isInited) {
      senderBg.dataset.inited = '1'
    }
  }, [])
  useEffect(() => {
    const disposedRef = { current: false }
    if (display) {
      const senderBg = senderBgRef.current
      if (!senderBg) return
      ;['--sw', '--sh'].forEach(k => senderBg.style.removeProperty(k))
      sync('display', { current: false })
    }
    return () => {
      disposedRef.current = true
    }
  }, [display, sync])
  useEffect(() => {
    const sender = senderRef.current
    const senderBg = senderBgRef.current
    if (!sender || !senderBg) return
    const disposedRef = { current: false }
    sync('init', disposedRef)
    const syncResize = sync.bind(null, 'resize', disposedRef)
    window.addEventListener('resize', syncResize)
    const observer = new ResizeObserver(sync.bind(null, 'observer', disposedRef))
    observer.observe(sender)
    return () => {
      disposedRef.current = true
      senderBg.dataset.inited = '0'
      window.removeEventListener('resize', syncResize)
      observer.disconnect()
    }
  }, [sync])

  const [assets, setAssets] = useState<Asset[]>([])

  useEventListener('keydown', e => {
    if (isShortcut(e, ['Escape'])) {
      setDisplay(false)
    }
  })
  return <>
    <div ref={senderBgRef} className={`${prefix}-bg`} />
    <div
      ref={senderRef}
      className={classnames(
        prefix,
        className,
        {
          [`${prefix}--header`]: visibles.header,
          [`${prefix}--footer`]: visibles.footer
        }
      )}
    >
      {memoDebouncedVisibles.header && props.header}
      <div className={`${prefix}__input`}>
        <Editor
          ref={shikitorRef}
          value={text}
          onChange={setText}
          defaultOptions={{
            language: 'markdown',
            lineNumbers: 'off',
            autoSize: { maxRows: 6 }
          }}
          options={useMemo(() => ({
            placeholder,
            theme: highlightTheme
          }), [placeholder, highlightTheme])}
          plugins={plugins}
          onColorChange={setColor}
          onMounted={shikitor => shikitor.focus()}
          onKeydown={async e => {
            if (isShortcut(e, ['Escape'])) {
              if (text) {
                setText('')
                e.preventDefault()
                e.stopPropagation()
                return
              }
            }
            if (isShortcut(e, ['metaOrCtrl', 'v'])) {
              const clipboard = [...await navigator.clipboard.read()]
              const images = await Promise.all(
                clipboard
                  .map(async item => {
                    const imageType = item.types.find(type => type.startsWith('image/'))
                    return imageType
                      ? imgBlob2base64(imageType, new Blob([await item.getType(imageType)]))
                      : null
                  })
              )
              setAssets(old => [
                ...old,
                ...images
                  .filter(<T,>(image: T): image is NonNullable<T> => image !== null)
                  .map(image => ({ type: 'image' as const, url: image }))
              ])
            }
            if (isShortcut(e, ['metaOrCtrl', 'Enter'])) {
              if (text.trim().length === 0 && assets.length === 0) return
              e.stopPropagation()
              e.preventDefault()
              sendMessage(text, assets)
              setAssets([])
              setText('')
              return
            }
          }}
        />
      </div>
      <div className={`${prefix}__resources`}>
        <ImageViewer
          closeOnOverlay
          closeOnEscKeydown
          images={assets.map(({ url }) => url)}
          trigger={({ open }) =>
            <>
              {assets.map(({ url }, i) => (
                <Image
                  key={i}
                  fit='contain'
                  src={url}
                  overlayTrigger='hover'
                  onClick={open}
                  overlayContent={
                    <>
                      <Button
                        shape='circle'
                        size='small'
                        variant='outline'
                        theme='danger'
                        className={`${prefix}__resource-remove`}
                        onClick={() => {
                          setAssets(old => old.filter((_, j) => j !== i))
                        }}
                      >
                        <span className='s-icon'>close</span>
                      </Button>
                    </>
                  }
                />
              ))}
            </>}
        />
      </div>
      {memoDebouncedVisibles.footer && props.footer}
      <StatusBar
        icon={icon}
        iconTooltip={iconTooltip}
        onClick:icon={() => clickIcon(ctxRef.current)}
        message={message}
      />
    </div>
  </>
}

Sender.prefix = 'spirit-sender'

const _Sender = forwardRef(Sender)
export { _Sender as Sender }

interface StatusBarProps {
  icon: ReactNode
  iconTooltip?: ReactNode
  'onClick:icon'?: () => void
  message?: ReactNode
}

function StatusBar(props: StatusBarProps) {
  const { prefix } = StatusBar
  const { icon, iconTooltip, message } = props

  return <div className={prefix}>
    <div className={`${prefix}__message`}>
      <Tooltip
        content={iconTooltip}
        placement='bottom'
      >
        <Button
          className={`${prefix}__prefix`}
          shape='square'
          size='small'
          variant='text'
          onClick={props['onClick:icon']}
        >
          {icon}
        </Button>
      </Tooltip>
      <span className={`${prefix}__text`}>
        {message}
      </span>
    </div>
    <div className={`${prefix}__actions`}>
      <Button
        size='small'
        variant='text'
      >
        Clear <Kbd keys={['meta', 'K']} />
      </Button>
      <div className={`${prefix}__action-split`} />
      <Button
        size='small'
        variant='text'
      >
        Send <Kbd keys={['meta', 'enter']} />
      </Button>
    </div>
  </div>
}

StatusBar.prefix = `${Sender.prefix}__status-bar`
