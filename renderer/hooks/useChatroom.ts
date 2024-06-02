import { useCallback, useMemo } from 'react'
import type { IUser } from 'spirit'

import { useElectronStore } from '../hooks/useStore'
import { uuid } from '../utils/uuid'
import { useUser } from './useUser'

export const useChatroom = () => {
  const [defaultU] = useUser()
  const [activeChatroom, setActiveChatroom] = useElectronStore('activeChatroom', 'default')
  const defaultChatroom = useMemo(() => ({
    id: activeChatroom ?? 'default',
    messages: []
  }), [activeChatroom])
  const [chatroom, setChatroom] = useElectronStore(`chatroom:${activeChatroom}`, defaultChatroom)
  const eCR = chatroom!
  const sendMessage = useCallback((text: string, user: IUser = defaultU) => {
    const message = { uuid: uuid(), ctime: Date.now(), text, user }
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
  const clearMessages = useCallback(() => {
    setChatroom(prev =>
      !prev
        ? defaultChatroom
        : ({ ...prev, messages: [] })
    )
  }, [defaultChatroom, setChatroom])

  return [eCR, {
    setActiveChatroom,
    setChatroom,
    sendMessage,
    editMessage,
    clearMessages
  }] as const
}
