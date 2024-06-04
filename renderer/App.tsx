import './App.scss'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { UserIcon } from 'tdesign-icons-react'
import { Avatar, AvatarGroup, Button, Popconfirm, Tabs, Tooltip } from 'tdesign-react'

import chatgptIcon from './assets/chatgpt.svg'
import { Configurer } from './components/Configurer'
import { Kbd } from './components/Kbd'
import { Message } from './components/Message'
import { Sender } from './components/Sender'
import { useChatroom, useChatrooms } from './hooks/useChatroom'
import { useEventListener } from './hooks/useEventListener'
import { useMDRender } from './hooks/useMDRender'
import { useElectronStore } from './hooks/useStore'
import { useUser } from './hooks/useUser'
import { uuid } from './utils/uuid'

function Chatrooms() {
  const [activeChatroom, { setActiveChatroom }] = useChatroom()
  const [chatrooms, { addChatroom, delChatroom }] = useChatrooms()
  useEventListener('keydown', () => {
    // TODO
  })
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
            <div className={`${'spirit'}-chatroom-kbds`}>
              {[
                activeChatroom.id !== c && index < 9
                  ? <Kbd key='k0' keys={['meta', `${index + 1}`]} />
                  : undefined,
                activeChatroom.id !== c && index === chatrooms.length - 1
                  ? <Kbd key='k1' keys={['meta', 'shift', 'right']} />
                  : undefined,
                chatrooms[index - 1] === activeChatroom.id
                  ? <Kbd key='k2' keys={['meta', 'right']} />
                  : undefined,
                chatrooms[index + 1] === activeChatroom.id
                  ? <Kbd key='k3' keys={['meta', 'left']} />
                  : undefined
              ]
                .filter(<T,>(v: T | undefined): v is T => !!v)
                .reduce(
                  (acc, curr, currentIndex) =>
                    acc.length > 0
                      ? [...acc, <span key={currentIndex}>/</span>, curr]
                      : [curr],
                  [] as ReactNode[]
                )}
            </div>
          </>
        }
        placement='top-left'
        popperOptions={{
          modifiers: [{ name: 'offset', options: { offset: [0, -20] } }]
        }}
      >
        <div className={`${'spirit'}-chatroom`}>
          <AvatarGroup cascading='left-up'>
            <Avatar
              size='18px'
              shape='circle'
              icon={<UserIcon />}
            />
            <Avatar
              size='18px'
              shape='circle'
              image={chatgptIcon}
            />
          </AvatarGroup>
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
            <Tooltip
              content={
                <>
                  Delete {c === activeChatroom.id ? 'current' : 'this'} chatroom
                  {c === activeChatroom.id && <Kbd keys={['meta', 'w']} />}
                </>
              }
              placement='bottom'
            >
              <Button
                shape='circle'
                variant='text'
                size='small'
                onClick={e => e.stopPropagation()}
              >
                <span className='s-icon'>close</span>
              </Button>
            </Tooltip>
          </Popconfirm>}
        </div>
      </Tooltip>
    }))}
    value={activeChatroom.id}
    onChange={v => setActiveChatroom(v as string)}
    onAdd={() => {
      const chatroom = uuid()
      addChatroom(chatroom)
      setActiveChatroom(chatroom)
    }}
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
