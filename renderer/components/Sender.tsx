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
import { useAtom } from 'jotai'
import type { ForwardedRef, ReactNode } from 'react'
import { Fragment } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Asset } from 'spirit'
import { Button, Dropdown, Image, ImageViewer, Input, MessagePlugin, Tooltip } from 'tdesign-react'

import { selectionsGroupsAtom, senderAtom } from '../atoms/sender'
import { useChatroom } from '../hooks/useChatroom'
import { useColor } from '../hooks/useColor'
import { useCtxCallback } from '../hooks/useCtxCallback'
import { useEventCallback } from '../hooks/useEventCallback'
import { useEventListener } from '../hooks/useEventListener'
import { useElectronStore } from '../hooks/useStore'
import { ee } from '../instances/ee'
import { useHighlightTheme } from '../providers/theme'
import chatroomCompletions from '../shikitor-plugins/chatroom-completions'
import { electronStore, keyAtom } from '../store'
import { classnames } from '../utils/classnames'
import { imgBlob2base64 } from '../utils/imgBlob2base64'
import { isShortcut } from '../utils/isShortcut'
import { Kbd } from './Kbd'

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
  actions?: ReactNode
  header?: ReactNode
  footer?: ReactNode
  onIconClick(this: SenderContext, ctx: SenderContext): void
}

function Sender(props: SenderProps, ref: ForwardedRef<SenderContext>) {
  const { t } = useTranslation()
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

  const [assets, setAssets] = useState<Asset[]>([])
  const [, { sendMessage }] = useChatroom()
  const send = useEventCallback((text: string | undefined, assets: Asset[]) => {
    if (!text || text.trim().length === 0 && assets.length === 0) {
      throw new Error('Empty message')
    }
    sendMessage(text, assets)
    setAssets([])
    setText('')
  })
  const [sender, setSender] = useAtom(senderAtom)
  const [text, setText] = [
    sender?.text,
    useEventCallback((text: string) => {
      setSender({ ...sender, text, send })
    })
  ]

  const [selectionsGroups] = useAtom(selectionsGroupsAtom)
  const [selectionIndex, setSelectionIndex] = useState<[number, number] | undefined>(undefined)
  useEffect(() => {
    setSelectionIndex(undefined)
  }, [selectionsGroups])
  const triggerSelectionAction = useEventCallback((
    type: 'click' | 'enter',
    i: number,
    j: number
  ) => {
    const selection = selectionsGroups[i]?.selections[j]
    const action = selection.actions?.[type] ?? selection.actions?.default
    if (!action) return
    // @ts-ignore
    ee.emit('act', ...action)
  })

  const [display, setDisplay] = useElectronStore('display')
  const shikitorRef = useRef<Shikitor>(null)
  useEffect(() => {
    if (display) {
      shikitorRef.current?.focus()
    }
  }, [display])

  const { setColor } = useColor(() => {}, [])

  const highlightTheme = useHighlightTheme()

  useEventListener('keydown', e => {
    if (isShortcut(e, ['Escape'])) {
      setDisplay(false)
    }
  })
  return <div className={`${prefix}-wrap`}>
    <div className={`${prefix}-bg`} />
    <div
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
            theme: highlightTheme
          }), [highlightTheme])}
          plugins={plugins}
          onColorChange={setColor}
          onMounted={shikitor => shikitor.focus()}
          onKeydown={async e => {
            if (isShortcut(e, ['Escape'])) {
              if (selectionIndex !== undefined) {
                setSelectionIndex(undefined)
                e.preventDefault()
                e.stopPropagation()
                return
              }
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
              try {
                send(text, assets)
                e.stopPropagation()
                e.preventDefault()
                return
              } catch (e) {
                console.error(e)
                if (e instanceof Error) {
                  MessagePlugin.warning(e.message)
                }
              }
            }
            if (isShortcut(e, ['Enter'])) {
              if (selectionIndex === undefined) return
              triggerSelectionAction('enter', ...selectionIndex)
              e.preventDefault()
              e.stopPropagation()
            }
            const shikitor = shikitorRef.current
            if (shikitor) {
              const { cursor } = shikitor
              // TODO metaOrCtrl + shift + ArrowUp
              if (isShortcut(e, ['ArrowUp'])) {
                if (cursor.line !== 1) return
                setSelectionIndex((index) => {
                  const [i, j] = index ?? [undefined, undefined]
                  if (i === undefined || j === undefined) {
                    return [0, 0]
                  }
                  const selections = selectionsGroups[i]?.selections
                  if (!selections) return [0, 0]
                  const nextJ = j - 1
                  if (nextJ < 0) {
                    return [
                      (i - 1 + selectionsGroups.length) % selectionsGroups.length,
                      selectionsGroups[(i - 1 + selectionsGroups.length) % selectionsGroups.length].selections.length
                      - 1
                    ]
                  }
                  return [
                    i,
                    nextJ
                  ]
                })
                e.preventDefault()
              }
              // TODO metaOrCtrl + shift + ArrowDown
              if (isShortcut(e, ['ArrowDown'])) {
                const lineCount = text?.split('\n').length ?? 1
                if (cursor.line !== lineCount) return
                setSelectionIndex((index) => {
                  const [i, j] = index ?? [undefined, undefined]
                  if (i === undefined || j === undefined) {
                    return [0, 0]
                  }
                  const selections = selectionsGroups[i]?.selections
                  if (!selections) return [0, 0]
                  const nextJ = j + 1
                  if (nextJ >= selections.length) {
                    return [
                      (i + 1) % selectionsGroups.length,
                      0
                    ]
                  }
                  return [
                    i,
                    nextJ
                  ]
                })
                e.preventDefault()
              }
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
      <div className={`${prefix}__selections`}>
        {selectionsGroups.map(({ title, operations, selections }, i) =>
          <Fragment key={i}>
            {title && title !== 'default' && <div className={`${prefix}__group`}>
              <div className={`${prefix}__group-title`}>
                {t(
                  // @ts-expect-error
                  title
                )}
              </div>
              <div className={`${prefix}__group-operations`}>
                {operations?.map(({ type, value, tooltip }, i) =>
                  <Tooltip
                    key={i}
                    content={t(
                      // @ts-expect-error
                      tooltip
                    )}
                  >
                    {type === 'icon'
                      ? <Button
                        shape='square'
                        variant='text'
                        size='small'
                      >
                        <span className='s-icon'>{value}</span>
                      </Button>
                      : <Button
                        variant='text'
                        size='small'
                      >
                        {t(
                          // @ts-expect-error
                          value
                        )}
                      </Button>}
                  </Tooltip>
                )}
              </div>
            </div>}
            {selections?.map(
              ({ icon, title, placeholder, operations }, j) =>
                <div
                  key={j}
                  className={classnames(`${prefix}__selection`, {
                    active: selectionIndex?.[0] === i && selectionIndex?.[1] === j
                  })}
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectionIndex([i, j])
                    triggerSelectionAction('click', i, j)
                  }}
                >
                  <div className={`${prefix}__selection-icon`}>
                    {icon.type === 'icon' && <span className='s-icon'>
                      {icon.value}
                    </span>}
                    {icon.type === 'image' && <img src={icon.path} alt='' />}
                  </div>
                  <div className={`${prefix}__selection-content`}>
                    <div className={`${prefix}__selection-title`}>
                      {title}
                    </div>
                    {placeholder && <div className={`${prefix}__selection-placeholder`}>
                      {placeholder}
                    </div>}
                  </div>
                  <div className={`${prefix}__selection-operations`}>
                    {operations?.map(({ type, value, tooltip }, i) =>
                      <Tooltip
                        key={i}
                        content={t(
                          // @ts-expect-error
                          tooltip
                        )}
                      >
                        {type === 'icon'
                          ? <Button
                            shape='square'
                            variant='text'
                            size='small'
                          >
                            <span className='s-icon'>{value}</span>
                          </Button>
                          : <Button
                            variant='text'
                            size='small'
                          >
                            {t(
                              // @ts-expect-error
                              value
                            )}
                          </Button>}
                      </Tooltip>
                    )}
                  </div>
                </div>
            )}
          </Fragment>
        )}
      </div>
      {memoDebouncedVisibles.footer && props.footer}
      <StatusBar
        icon={icon}
        iconTooltip={iconTooltip}
        onClick:icon={() => clickIcon(ctxRef.current)}
        message={message}
      />
    </div>
  </div>
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
  const { t } = useTranslation()
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
        className={`${prefix}__action`}
        size='small'
        variant='text'
      >
        Clear <Kbd keys={['meta', 'K']} />
      </Button>
      <div className={`${prefix}__action-split`} />
      <Button
        className={`${prefix}__action`}
        size='small'
        variant='text'
      >
        Send <Kbd keys={['meta', 'enter']} />
      </Button>
      <div className={`${prefix}__action-split`} />
      <Dropdown
        trigger='click'
        placement='bottom-right'
        minColumnWidth={250}
        panelTopContent={
          <Input
            borderless
            clearable
            className={`${prefix}__dropdown-action-searcher`}
            placeholder='Search actions...'
            onClick={({ e }) => e.stopPropagation()}
          />
        }
        options={[
          {
            content: <div className={`${prefix}__dropdown-action`}>
              {t('Display configure panel')}
              <Kbd keys={['meta', ',']} />
            </div>
          },
          {
            content: <div className={`${prefix}__dropdown-action`}>
              Create new chatroom
              <Kbd keys={['meta', 'n']} />
            </div>
          },
          {
            content: <div className={`${prefix}__dropdown-action`}>
              Archive current chatroom
              <Kbd keys={['meta', 'w']} />
            </div>
          },
          {
            content: <div className={`${prefix}__dropdown-action`}>
              Close/Clear input text
              <Kbd keys={['Escape']} />
            </div>
          }
        ]}
        popupProps={{
          popperOptions: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] }
        }}
      >
        <Button
          className={`${prefix}__action`}
          shape='square'
          size='small'
          variant='text'
        >
          <span className='s-icon'>more_vert</span>
        </Button>
      </Dropdown>
    </div>
  </div>
}

StatusBar.prefix = `${Sender.prefix}__status-bar`
