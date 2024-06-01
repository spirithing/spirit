/* eslint-disable no-extra-semi */
import './Sender.scss'
import '@shikitor/core/plugins/provide-completions.css'
import '@shikitor/core/plugins/provide-popup.css'
import '@shikitor/core/plugins/provide-selection-toolbox.css'

import provideCompletions from '@shikitor/core/plugins/provide-completions'
import providePopup from '@shikitor/core/plugins/provide-popup'
import provideSelectionToolbox from '@shikitor/core/plugins/provide-selection-toolbox'
import selectionToolboxForMd from '@shikitor/core/plugins/selection-toolbox-for-md'
import { Editor } from '@shikitor/react'
import type OpenAI from 'openai'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Bot, IMessage } from 'spirit'
import { DialogPlugin, MessagePlugin, Tooltip } from 'tdesign-react'

import favicon from '../../resources/icon.png'
import { useBot } from '../hooks/useBot'
import { useChatroom } from '../hooks/useChatroom'
import { useColor } from '../hooks/useColor'
import { useEEListener } from '../hooks/useEEListener'
import { useOpenAI } from '../hooks/useOpenAI'
import { useElectronStore } from '../hooks/useStore'

export interface SenderProps {
  className?: string
  Icon?: (({ onClick }: { onClick(): void }) => ReactNode) | string
  Header?: ReactNode
  Footer?: ReactNode
  onIconClick(): void
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

export function Sender(props: SenderProps) {
  const prefix = 'spirit-sender'
  const {
    className,
    Icon,
    onIconClick
  } = props
  const { t } = useTranslation()

  const [, { sendMessage, editMessage, clearMessages }] = useChatroom()
  const openai = useOpenAI()
  const [bot] = useBot()
  const messageTransformWithBot = useCallback((m: IMessage) => messageTransform(bot!, m), [bot])

  useEEListener('addMessage', async (m, { messages }) => {
    if (m.user === bot) return
    if (import.meta.env.DEV && m.text === 'd') {
      sendMessage('pong', bot)
      return
    }

    if (!bot) {
      MessagePlugin.error('Bot not initialized')
      return
    }
    if (!openai) {
      MessagePlugin.error('OpenAI not initialized')
      return
    }
    const completions = await openai.chat.completions.create({
      model: 'gpt-4o',
      // eslint-disable-next-line camelcase
      max_tokens: 4096,
      messages: [
        {
          content: `Your name is "${bot.name}" and your description is "${bot.description}".\n`
            + 'Every message except yours has a corresponding username, in the format where the current message username appears at the beginning of each message.',
          role: 'system'
        },
        ...messages.map(messageTransformWithBot).reverse()
      ],
      stream: true
    })
    sendMessage('', bot)
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

  const [, setDisplay] = useElectronStore('display')
  const [text, setText] = useState('')
  const { setColor } = useColor(() => {}, [])
  function IconComp() {
    if (Icon === undefined) {
      return <img
        alt='icon'
        src={favicon}
        className={`${prefix}__icon`}
        onClick={onIconClick}
      />
    }
    if (typeof Icon === 'string') {
      return <span className='s-icon' onClick={onIconClick}>
        {Icon}
      </span>
    }
    return <Icon {...{ onClick: onIconClick }} />
  }
  return <div className={`${prefix} ${className}`}>
    {props.Header}
    <div className={`${prefix}__input`}>
      <Tooltip
        content={
          <>
            {t('Display configure panel')}
            <br />
            ⌘ + /
          </>
        }
        placement='bottom'
        popperOptions={{
          modifiers: [{ name: 'offset', options: { offset: [0, -10] } }]
        }}
      >
        <div className={`${prefix}__prefix`}>
          <IconComp />
        </div>
      </Tooltip>
      <Editor
        value={text}
        onChange={setText}
        defaultOptions={{
          language: 'markdown',
          lineNumbers: 'off',
          theme: 'material-theme-darker',
          autoSize: { maxRows: 6 }
        }}
        options={useMemo(() => ({
          placeholder
        }), [placeholder])}
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
            clearMessages()
            return
          }
          if (e.key === '/' && e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
            e.preventDefault()
            onIconClick()
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
    {props.Footer}
  </div>
}
