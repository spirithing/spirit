import './App.scss'

import { useEffect } from 'react'

import { Configurer } from './components/Configurer'
import { Message } from './components/Message'
import { Sender } from './components/Sender'
import { useChatroom } from './hooks/useChatroom'
import { useMDRender } from './hooks/useMDRender'
import { useElectronStore } from './hooks/useStore'

function Messages() {
  const mdRef = useMDRender()
  const [{ messages }] = useChatroom()

  return <div className='messages'>
    {messages?.map(message => (
      <Message
        key={message.uuid}
        value={message}
        textRender={text => (
          <div className='message-text'>
            <div
              className='s-md'
              dangerouslySetInnerHTML={{
                __html: mdRef.current?.render(text) ?? ''
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
      <Sender
        onIconClick={ctx => ctx.toggleFooter()}
        Footer={<Configurer />}
      />
      <Messages />
    </div>
  </>
}
