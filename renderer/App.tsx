import './App.scss'

import { useEffect } from 'react'

import { Configurer } from './components/Configurer'
import { Message } from './components/Message'
import { Sender } from './components/Sender'
import { Chatrooms } from './extensions/chatroom/Chatrooms'
import { useChatroom } from './hooks/useChatroom'
import { useEventListener } from './hooks/useEventListener'
import { useMDRender } from './hooks/useMDRender'
import { useElectronStore } from './hooks/useStore'
import { useUser } from './hooks/useUser'
import { isShortcut } from './utils/isShortcut'

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
  useEventListener('keydown', e => {
    if (isShortcut(e, ['meta', ','])) {
      e.preventDefault()
      // TODO
    }
  })
  return <>
    <div className='spirit-main'>
      <Sender
        onIconClick={ctx => ctx.toggleFooter()}
        Header={<Chatrooms />}
        Footer={<Configurer />}
      />
      <Messages />
    </div>
  </>
}
