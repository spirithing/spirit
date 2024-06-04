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
import { isEqual } from 'lodash-es'
import type OpenAI from 'openai'
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Bot, IMessage } from 'spirit'
import { DialogPlugin, MessagePlugin, Tooltip } from 'tdesign-react'

import favicon from '../../resources/icon.png'
import { useBot } from '../hooks/useBot'
import { useChatroom } from '../hooks/useChatroom'
import { useColor } from '../hooks/useColor'
import { useCtxCallback } from '../hooks/useCtxCallback'
import { useEEListener } from '../hooks/useEEListener'
import { useOpenAI } from '../hooks/useOpenAI'
import { useElectronStore } from '../hooks/useStore'
import { useHighlightTheme } from '../providers/theme'
import { classnames } from '../utils/classnames'
import { Kbd } from './Kbd'

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
  Icon?: (({ onClick }: { onClick: SenderProps['onIconClick'] }) => ReactNode) | string
  Header?: ReactNode
  Footer?: ReactNode
  onIconClick(this: SenderContext, ctx: SenderContext): void
}

const yiyan = [
  '人生没有彩排，每天都是现场直播。',
  '人生不如意十之八九，剩下的一二分，也未必如意。',
  '人生就是起起落落，落落又起起。',
  '机器人的人生也不容易，每天充电，还要听人吹牛。',
  '这是由 AI 生成的一句话。'
]

const plugins = [
  providePopup,
  provideCompletions,
  provideSelectionToolbox,
  selectionToolboxForMd
]

function messageTransform(bot: Bot, m: IMessage): OpenAI.ChatCompletionMessageParam {
  const isBot = m.user?.name === bot.name
  return {
    role: isBot ? 'assistant' : 'user',
    content: `${isBot ? '' : `${m.user?.name}:\n`}${m.text}`
  }
}

const useSenderCtx = () => {
  const [visibles, setVisibles] = useState({
    header: false,
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

export function Sender(props: SenderProps) {
  const prefix = 'spirit-sender'
  const ctxRef = useSenderCtx()
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
    Icon,
    onIconClick
  } = props
  const clickIcon = useCtxCallback(ctxRef, onIconClick)
  const { t } = useTranslation()

  const [{ options }, { sendMessage, editMessage, clearMessages }] = useChatroom()
  const openai = useOpenAI()
  const [openaiConfig] = useElectronStore('openaiConfig')
  const [bot] = useBot()
  const messageTransformWithBot = useCallback((m: IMessage) => messageTransform(bot!, m), [bot])

  const getModel = useCallback(() => {
    return options?.model ?? openaiConfig?.defaultModel ?? 'gpt-4o'
  }, [openaiConfig?.defaultModel, options?.model])

  useEEListener('addMessage', async (m, { messages }) => {
    if (isEqual(m.user, bot)) return
    if (import.meta.env.DEV && m.text === 'd') {
      sendMessage('pong', bot)
      return
    }

    if (!bot) {
      // TODO check name and description is empty, and prompt user to configure it
      MessagePlugin.error('Bot not initialized')
      return
    }
    if (!openai) {
      // TODO prompt user to configure it
      MessagePlugin.error('OpenAI not initialized')
      return
    }
    const { uuid } = sendMessage('Inputting', bot)
    let count = 0
    const t = setInterval(() => {
      editMessage(0, 'Inputting' + '.'.repeat(count))
      count = (count + 1) % 4
    }, 300)
    const completions = await openai.chat.completions.create({
      model: getModel(),
      // eslint-disable-next-line camelcase
      max_tokens: 4096,
      messages: [
        {
          content: `Your name is "${bot.name}" and your description is "${bot.description}".\n`
            + 'Every message except yours has a corresponding username, in the format where the current message username appears at the beginning of each message.',
          role: 'system'
        },
        ...messages?.map(messageTransformWithBot).reverse() ?? []
      ],
      stream: true
    }).finally(() => clearInterval(t))
    editMessage(uuid, '')
    let streamMessage = ''
    for await (const { choices: [{ delta }] } of completions) {
      streamMessage += delta.content ?? ''
      editMessage(0, streamMessage)
    }
  })

  const [yiyanIndex, setYiyanIndex] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setYiyanIndex(i => (i + 1) % yiyan.length)
    }, 30000)
    return () => clearInterval(timer)
  }, [])
  const placeholder = useMemo(() => yiyan[yiyanIndex], [yiyanIndex])

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
  const IconComp = useCallback(function IconComp() {
    if (Icon === undefined) {
      return <img
        alt='icon'
        src={favicon}
        className={`${prefix}__icon`}
        onClick={() => clickIcon(ctxRef.current)}
      />
    }
    if (typeof Icon === 'string') {
      return <span className='s-icon' onClick={() => clickIcon(ctxRef.current)}>
        {Icon}
      </span>
    }
    return <Icon {...{ onClick: onIconClick }} />
  }, [Icon, clickIcon, ctxRef, onIconClick])

  const senderBgRef = useRef<HTMLDivElement>(null)
  const senderRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // 监听同步 Sender 位置以及宽高给 SenderBg
    const sender = senderRef.current
    const senderBg = senderBgRef.current
    if (!sender || !senderBg) return
    let disposed = false
    const sync = async (type: string) => {
      const isInited = senderBg.dataset.inited === '1'
      if (!isInited && type !== 'init') return
      await new Promise(resolve =>
        setTimeout(
          resolve,
          {
            init: 0,
            resize: 200,
            observer: 0
          }[type]
        )
      )
      if (disposed) return
      const { x, y, width, height } = sender.getBoundingClientRect()
      console.debug('sync', { type }, x, y, width, height)
      senderBg.style.setProperty('--st', y + 'px')
      senderBg.style.setProperty('--sl', x + 'px')
      senderBg.style.setProperty('--sw', width + 'px')
      senderBg.style.setProperty('--sh', height + 'px')
      if (!isInited) {
        senderBg.dataset.inited = '1'
      }
    }
    sync('init')
    const syncResize = sync.bind(null, 'resize')
    window.addEventListener('resize', syncResize)
    const observer = new ResizeObserver(sync.bind(null, 'observer'))
    observer.observe(sender)
    return () => {
      disposed = true
      senderBg.dataset.inited = '0'
      window.removeEventListener('resize', syncResize)
      observer.disconnect()
    }
  }, [])
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
      {memoDebouncedVisibles.header && props.Header}
      <div className={`${prefix}__input`}>
        <Tooltip
          content={
            <>
              {t('Display configure panel')}
              <br />
              <Kbd keys={['meta', ',']} />
            </>
          }
          placement='bottom'
          popperOptions={{
            modifiers: [{ name: 'offset', options: { offset: [0, -5] } }]
          }}
        >
          <div className={`${prefix}__prefix`}>
            <IconComp />
          </div>
        </Tooltip>
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
              clearMessages()
              return
            }
            if (e.key === ',' && e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
              e.preventDefault()
              clickIcon(ctxRef.current)
            }
            if (e.key === 'Enter' && e.metaKey) {
              e.preventDefault()
              sendMessage(text)
              setText('')
              return
            }
          }}
        />
      </div>
      {memoDebouncedVisibles.footer && props.Footer}
    </div>
  </>
}
