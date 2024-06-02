import { useCallback, useMemo } from 'react'
import type { IUser } from 'spirit'

import { useElectronStore } from '../hooks/useStore'
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
    setChatroom(prev => {
      if (!prev) return defaultChatroom
      return {
        ...prev,
        messages: [
          { ctime: Date.now(), text, user },
          ...prev.messages ?? []
        ]
      }
    })
  }, [defaultChatroom, defaultU, setChatroom])
  const editMessage = useCallback((index: number, text: string) => {
    setChatroom(prev => {
      if (!prev) return defaultChatroom
      if (!prev.messages) {
        throw new Error('No messages')
      }
      if (index < 0 || index >= prev.messages.length) {
        throw new Error('Invalid index')
      }
      prev.messages[index].text = text
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
