import './App.scss'

import { useEffect } from 'react'
import { Button, Popconfirm, Tabs, Tooltip } from 'tdesign-react'

import { Configurer } from './components/Configurer'
import { Kbd } from './components/Kbd'
import { Message } from './components/Message'
import { Sender } from './components/Sender'
import { useChatroom, useChatrooms } from './hooks/useChatroom'
import { useMDRender } from './hooks/useMDRender'
import { useElectronStore } from './hooks/useStore'
import { useUser } from './hooks/useUser'
import { uuid } from './utils/uuid'

function Chatrooms() {
  const [activeChatroom, { setActiveChatroom }] = useChatroom()
  const [chatrooms, { addChatroom, delChatroom }] = useChatrooms()
  return <Tabs
    addable
    className={`${'spirit'}-chatrooms`}
    list={chatrooms.map((c, index) => ({
      value: c,
      label: <Tooltip
        overlayClassName={`${'spirit'}-chatroom-tooltip`}
        content={
          <>
            {c}
            <div className={`${'spirit'}-chatroom-desc`}>
              No description for now.
            </div>
            {index > 9
              ? <></>
              : activeChatroom.id === c
              ? <></>
              : <Kbd keys={['meta', `${index + 1}`]} />}
          </>
        }
        placement='top-left'
        popperOptions={{
          modifiers: [{ name: 'offset', options: { offset: [0, -20] } }]
        }}
      >
        <div className={`${'spirit'}-chatroom`}>
          <span className={`${'spirit'}-chatroom-label`}>{c}</span>
          {c !== 'default' && <Popconfirm
            placement='bottom-left'
            content='Are you sure?'
            onConfirm={({ e }) => {
              e.stopPropagation()
              setActiveChatroom(chatrooms[index + 1] ?? 'default')
              delChatroom(c)
            }}
            onCancel={({ e }) => e.stopPropagation()}
          >
            <Button
              shape='circle'
              variant='text'
              size='small'
              onClick={e => e.stopPropagation()}
            >
              <span className='s-icon'>close</span>
            </Button>
          </Popconfirm>}
        </div>
      </Tooltip>
    }))}
    value={activeChatroom.id}
    onChange={v => setActiveChatroom(v as string)}
    onAdd={() => addChatroom(uuid())}
  />
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
      <Sender
        onIconClick={ctx => ctx.toggleFooter()}
        Header={<Chatrooms />}
        Footer={<Configurer />}
      />
      <Messages />
    </div>
  </>
}
