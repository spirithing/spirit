import './Chatrooms.scss'

import { classnames } from '@shikitor/core/utils'
import type { CSSProperties, ReactNode } from 'react'
import { UserIcon } from 'tdesign-icons-react'
import { Avatar, AvatarGroup, Button, Tabs, Tooltip } from 'tdesign-react'

import chatgptIcon from '../../assets/chatgpt.svg'
import { Kbd } from '../../components/Kbd'
import { useChatroom, useChatrooms } from '../../hooks/useChatroom'
import { useEventListener } from '../../hooks/useEventListener'
import { isShortcut } from '../../utils/isShortcut'
import { uuid } from '../../utils/uuid'

export interface ChatroomsProps {
  style?: CSSProperties
  className?: string
}

export function Chatrooms(props: ChatroomsProps) {
  const { prefix } = Chatrooms
  const { className, style } = props
  const [activeChatroom, { setActiveChatroom }] = useChatroom()
  const [chatrooms, { addChatroom, delChatroom }] = useChatrooms()
  useEventListener('keydown', e => {
    if (chatrooms.length > 1 /* TODO add text is empty check */) {
      if (isShortcut(e, ['meta', 'shift', 'ArrowRight'])) {
        setActiveChatroom(chatrooms[chatrooms.length - 1])
        e.preventDefault()
        return
      }
      if (isShortcut(e, ['meta', 'ArrowRight'])) {
        const index = chatrooms.indexOf(activeChatroom.id)
        if (index !== -1) {
          setActiveChatroom(chatrooms[(index + 1) % chatrooms.length])
          e.preventDefault()
          return
        }
      }
      if (isShortcut(e, ['meta', 'ArrowLeft'])) {
        const index = chatrooms.indexOf(activeChatroom.id)
        if (index !== -1) {
          setActiveChatroom(chatrooms[(index - 1 + chatrooms.length) % chatrooms.length])
          e.preventDefault()
          return
        }
      }
    }
    if (isShortcut(e, ['meta', 'n'])) {
      const chatroom = uuid()
      addChatroom(chatroom)
      setActiveChatroom(chatroom)
      e.preventDefault()
      return
    }
  })
  return <Tabs
    style={style}
    className={classnames(prefix, className)}
    list={chatrooms.map((c, index) => ({
      value: c,
      label: <Tooltip
        overlayClassName={`${prefix}-tooltip`}
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
          {c !== 'default' && <Tooltip
            content={
              <>
                Archive {c === activeChatroom.id ? 'current' : 'this'} chatroom
                {c === activeChatroom.id && <Kbd keys={['meta', 'w']} />}
              </>
            }
            placement='bottom'
          >
            <Button
              shape='circle'
              variant='text'
              size='small'
              onClick={e => {
                e.stopPropagation()
                setActiveChatroom(chatrooms[index + 1] ?? 'default')
                delChatroom(c)
              }}
            >
              <span className='s-icon'>archive</span>
            </Button>
          </Tooltip>}
        </div>
      </Tooltip>
    }))}
    value={activeChatroom.id}
    onChange={v => setActiveChatroom(v as string)}
    action={
      <>
        <Tooltip
          content={
            <>
              Add new chatroom
              <Kbd keys={['meta', 'n']} />
            </>
          }
          placement='bottom'
          popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] }}
        >
          <Button
            variant='text'
            size='small'
            onClick={() => {
              const chatroom = uuid()
              addChatroom(chatroom)
              setActiveChatroom(chatroom)
            }}
          >
            <span className='s-icon'>Add</span>
          </Button>
        </Tooltip>
        <Button
          variant='text'
          size='small'
          onClick={() => {
            // TODO
          }}
        >
          <span className='s-icon'>filter_alt</span>
        </Button>
      </>
    }
  />
}
Chatrooms.prefix = `${'spirit'}-chatrooms`
