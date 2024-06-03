import './App.scss'

import { useEffect, useState } from 'react'
import { Card } from 'tdesign-react'

import { Configurer } from './components/Configurer'
import { Message } from './components/Message'
import { ModelSelector } from './components/selectors/ModelSelector'
import { Sender } from './components/Sender'
import { useChatroom, useChatrooms } from './hooks/useChatroom'
import { useMDRender } from './hooks/useMDRender'
import { useElectronStore } from './hooks/useStore'
import { useUser } from './hooks/useUser'
import { classnames } from './utils/classnames'
import { uuid } from './utils/uuid'

interface ConfirmBtnProps {
  className?: string
  onConfirm?(): void
}

function ConfirmBtn({
  className,
  onConfirm
}: ConfirmBtnProps) {
  const [needConfirm, setNeedConfirm] = useState(false)
  return <div
    tabIndex={0}
    className={classnames(
      className,
      `${'spirit'}-confirm-button`,
      {
        [`${'spirit'}-confirm-button--active`]: needConfirm
      }
    )}
    onBlur={() => setNeedConfirm(false)}
    onClick={e => (
      e.stopPropagation(),
        needConfirm
          ? onConfirm?.()
          : setNeedConfirm(true)
    )}
  >
    {!needConfirm
      ? <span className='s-icon'>delete</span>
      : <>
        Confirm?
        <span className='s-icon'>check</span>
      </>}
  </div>
}

function Chatrooms() {
  const [activeChatroom, { setActiveChatroom }] = useChatroom()
  const [chatrooms, { addChatroom, delChatroom }] = useChatrooms()
  const [model, setModel] = useState<string>('gpt-4o')
  return <div className={`${'spirit'}-chatrooms`}>
    <div onClick={() => addChatroom(uuid(), model)}>
      <Card className={`${'spirit'}-chatroom__create`}>
        <div className='s-icon'>add</div>
        <ModelSelector value={model} onChange={setModel} />
      </Card>
    </div>
    {chatrooms?.map(chatroom => (
      <div key={chatroom} onClick={() => setActiveChatroom(chatroom)}>
        <Card
          className={classnames(
            `${'spirit'}-chatroom`,
            {
              [`${'spirit'}-chatroom--active`]: chatroom === activeChatroom.id
            }
          )}
          header={
            <>
              <span className='s-icon'>chat</span>
              {chatroom}
            </>
          }
        >
          No Description
          <div className={`${'spirit'}-chatroom__opts`}>
            <div
              className={`s-icon ${'spirit'}-chatroom__opt ${'spirit'}-chatroom__download`}
              onClick={e => e.stopPropagation()}
            >
              download
            </div>
            <ConfirmBtn
              className={`${'spirit'}-chatroom__opt ${'spirit'}-chatroom__del`}
              onConfirm={() => delChatroom(chatroom)}
            />
          </div>
        </Card>
      </div>
    ))}
  </div>
}

function Messages() {
  const mdr = useMDRender()
  const [user] = useUser()
  const [{ messages }, { editMessage, delMessage }] = useChatroom()

  return <div className={`${'spirit'}-messages`}>
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
  useDisplay()
  return <>
    <div className='spirit-main'>
      <Chatrooms />
      <Sender
        onIconClick={ctx => ctx.toggleFooter()}
        Footer={<Configurer />}
      />
      <Messages />
    </div>
  </>
}
