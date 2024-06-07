import './Messages.scss'

import { classnames } from '@shikitor/core/utils'
import type { CSSProperties } from 'react'

import { Message } from '../../components/Message'
import { useChatroom } from '../../hooks/useChatroom'
import { useMDRender } from '../../hooks/useMDRender'
import { useUser } from '../../hooks/useUser'

export interface MessagesProps {
  style?: CSSProperties
  className?: string
}

export function Messages(props: MessagesProps) {
  const { prefix } = Messages
  const { className, style } = props
  const mdr = useMDRender()
  const [user] = useUser()
  const [{ messages }, { editMessage, delMessage }] = useChatroom()

  return <div
    style={style}
    className={classnames(prefix, className)}
  >
    {messages?.map(message => (
      <Message
        key={message.uuid}
        className={message.user?.name === user.name ? 'self' : 'other'}
        value={message}
        onTextChange={text => editMessage(message.uuid, text)}
        onDelete={() => delMessage(message.uuid)}
        textRender={text => (
          <div className='message-text'>
            <div
              className='s-md'
              dangerouslySetInnerHTML={{
                __html: mdr.render(text) ?? ''
              }}
            />
          </div>
        )}
      />
    ))}
  </div>
}
Messages.prefix = `${'spirit'}-messages`