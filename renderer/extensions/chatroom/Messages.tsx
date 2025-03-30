import './Messages.scss'

import { classnames } from '@shikitor/core/utils'
import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import { ChevronRightIcon } from 'tdesign-icons-react'
import { MessagePlugin } from 'tdesign-react'

import { Message } from '../../components/Message'
import { useChatroom } from '../../hooks/useChatroom'
import { useEventListener } from '../../hooks/useEventListener'
import { useMDRender } from '../../hooks/useMDRender'
import { useUser } from '../../hooks/useUser'
import { isShortcut } from '../../utils/isShortcut'

export interface MessagesProps {
  style?: CSSProperties
  className?: string
}

function MessageMdRender({ text }: { text: string }) {
  const mdr = useMDRender()
  const [displayThinking, setDisplayThink] = useState(false)
  const [, thinkText = '', thoughtText = ''] = useMemo(
    () => text.match(/^\n*<think[^>]*>([\s\S]*?)(?:<\/think>\n*([\s\S]*))?$/) ?? [],
    [text]
  )
  const thinkState = useMemo(() => (
    text.startsWith('<think')
      ? thoughtText
        ? 'thought'
        : 'thinking'
      : 'not-think'
  ), [
    text,
    thoughtText
  ])
  const renderHTML = useMemo(() => {
    return mdr.render(
      thinkState === 'not-think'
        ? text
        : (
          displayThinking
            ? thinkText.split('\n').map(line => `> ${line}`).join('\n') + '\n'
            : ''
        ) + thoughtText
    )
  }, [displayThinking, mdr, text, thinkState, thinkText, thoughtText])
  return <div className='message-text'>
    {thinkState !== 'not-think'
      && <div
        className={classnames(
          'think-state',
          thinkState,
          displayThinking
            ? 'open'
            : 'close'
        )}
        onClick={() => setDisplayThink(b => !b)}
      >
        {{
          'thinking': '思考中',
          'thought': '已深度思考'
        }[thinkState]}
        <ChevronRightIcon />
      </div>}
    <div
      className='s-md'
      dangerouslySetInnerHTML={{ __html: renderHTML ?? '' }}
      onClick={async e => {
        if (e.target instanceof HTMLElement) {
          const ele = e.target.closest('.s-md-code-operators .s-icon.copy')
          if (ele) {
            try {
              await navigator.clipboard
                .writeText(ele.getAttribute('data-code') ?? '')
              await MessagePlugin.success('已复制')
            } catch (e) {
              await MessagePlugin.error('复制失败')
            }
          }
        }
      }}
    />
  </div>
}

export function Messages(props: MessagesProps) {
  const { prefix } = Messages
  const { className, style } = props
  const [user] = useUser()
  const [{ messages }, { editMessage, delMessage, clearMessages }] = useChatroom()

  useEventListener('keydown', e => {
    if (isShortcut(e, ['meta', 'k']) || isShortcut(e, ['ctrl', 'k'])) {
      clearMessages()
      e.stopPropagation()
      e.preventDefault()
      return
    }
  })
  return <div
    style={style}
    className={classnames(prefix, className)}
  >
    {messages?.map(message => (
      <Message
        key={message.uuid}
        className={classnames(
          message.user?.name === user.name ? 'self' : 'other',
          message.type === 'tool' && 'tool',
          (message.toolCalls?.length ?? 0) > 0 && 'tool-call'
        )}
        value={message}
        onTextChange={text => editMessage(message.uuid, text)}
        onDelete={() => delMessage(message.uuid)}
        TextRender={MessageMdRender}
      />
    ))}
  </div>
}
Messages.prefix = `${'spirit'}-messages`
