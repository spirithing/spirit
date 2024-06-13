import { useCallback, useMemo } from 'react'
import type { ChatRoom, IMessage, IUser, Store } from 'spirit'

import { ipcRenderer } from '../electron'
import { useElectronStore } from '../hooks/useStore'
import { getFromStore } from '../store'
import { keyUUID } from '../utils/keyUUIDs'
import { uuid } from '../utils/uuid'
import { useUser } from './useUser'

function updateChatroomMeta(id: string, chatroom: Pick<ChatRoom, 'name' | 'description'>) {
  let chatroomMetas: Store['chatroomMetas'] | undefined
  try {
    chatroomMetas = getFromStore('chatroomMetas')
  } catch (e) {
    console.error(e)
    chatroomMetas = {}
  }
  ipcRenderer.sendSync(
    'setStore',
    uuid(),
    'chatroomMetas',
    {
      ...chatroomMetas,
      [id]: {
        name: chatroom.name,
        description: chatroom.description
      }
    }
  )
}

export const useChatroom = () => {
  const [defaultU] = useUser()
  const [activeChatroom, setActiveChatroom] = useElectronStore('activeChatroom', 'default')
  const defaultChatroom = useMemo(() => ({
    id: activeChatroom ?? 'default',
    messages: []
  }), [activeChatroom])
  const [chatroom, setChatroom] = useElectronStore(`chatroom:${activeChatroom}`, defaultChatroom)
  const eCR = chatroom!
  const sendMessage = useCallback((
    text?: string,
    assets?: IMessage['assets'],
    user: IUser = defaultU
  ) => {
    const message = {
      uuid: uuid(),
      ctime: Date.now(),
      text,
      assets,
      user
    } as IMessage
    setChatroom(prev => {
      if (!prev) return defaultChatroom
      return {
        ...prev,
        messages: [
          message,
          ...prev.messages ?? []
        ]
      }
    })
    return message
  }, [defaultChatroom, defaultU, setChatroom])
  const getMessage = useCallback((index: number | string, chatroom: ChatRoom = eCR) => {
    if (!chatroom) {
      throw new Error('No chatroom')
    }
    const { messages } = chatroom
    if (!messages) {
      throw new Error('No messages')
    }
    if (typeof index === 'number' && (index < 0 || index >= messages.length)) {
      throw new Error('Invalid index')
    }
    if (typeof index === 'string') {
      index = messages.findIndex(m => m.uuid === index)
      if (index === -1) {
        throw new Error('Message not found')
      }
    }
    return [messages[index], index] as const
  }, [eCR])
  const editMessage = useCallback((index: number | string, text: string) => {
    setChatroom(prev => {
      if (!prev) return defaultChatroom
      const { messages } = prev
      if (!messages) {
        throw new Error('No messages')
      }
      if (typeof index === 'number' && (index < 0 || index >= messages.length)) {
        throw new Error('Invalid index')
      }
      if (typeof index === 'string') {
        index = messages.findIndex(m => m.uuid === index)
        if (index === -1) {
          throw new Error('Message not found')
        }
      }
      messages[index].text = text
      return { ...prev }
    })
  }, [defaultChatroom, setChatroom])
  const delMessage = useCallback((index: number | string) => {
    setChatroom(prev => {
      if (!prev) return defaultChatroom
      const [target, findIndex] = getMessage(index, prev)
      if (!target) return prev
      prev.messages?.splice(findIndex, 1)
      return { ...prev }
    })
  }, [defaultChatroom, getMessage, setChatroom])
  const clearMessages = useCallback(() => {
    setChatroom(prev =>
      !prev
        ? defaultChatroom
        : ({ ...prev, messages: [] })
    )
  }, [defaultChatroom, setChatroom])

  return [eCR, {
    setActiveChatroom,
    setChatroom: useCallback<typeof setChatroom>((chatroomOrGetter) => {
      return setChatroom(old => {
        const chatroom = typeof chatroomOrGetter === 'function'
          ? chatroomOrGetter(old)
          : chatroomOrGetter
        console.log('setChatroom', chatroom)
        updateChatroomMeta(chatroom.id, {
          name: chatroom.name,
          description: chatroom.description
        })
        return chatroom
      })
    }, [setChatroom]),
    sendMessage,
    editMessage,
    delMessage,
    clearMessages
  }] as const
}

const defaultChatrooms = ['default']
export const useChatrooms = () => {
  const [chatrooms, setChatrooms] = useElectronStore('chatrooms', defaultChatrooms)
  const addChatroom = useCallback((id: string, model?: string) => {
    setChatrooms(prev => {
      if (!prev) return defaultChatrooms
      return [id, ...prev]
    })
    ipcRenderer.sendSync(
      'setStore',
      keyUUID(`chatroom:${id}`),
      `chatroom:${id}`,
      {
        id,
        options: { model },
        messages: []
      }
    )
  }, [setChatrooms])
  const delChatroom = useCallback((id: string) => {
    setChatrooms(prev => {
      if (!prev) return defaultChatrooms
      return prev.filter(c => c !== id)
    })
    ipcRenderer.sendSync(
      'setStore',
      keyUUID(`chatroom:${id}`),
      `chatroom:${id}`
    )
  }, [setChatrooms])
  const updChatroom = useCallback((id: string, chatroom: ChatRoom) => {
    ipcRenderer.sendSync(
      'setStore',
      keyUUID(`chatroom:${id}`),
      `chatroom:${id}`,
      chatroom
    )
    updateChatroomMeta(id, chatroom)
  }, [])

  return [chatrooms, {
    setChatrooms,
    addChatroom,
    delChatroom,
    updChatroom
  }] as const
}
