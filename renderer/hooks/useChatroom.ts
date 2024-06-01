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
    setChatroom(prev =>
      !prev
        ? defaultChatroom
        : ({
          ...prev,
          messages: [
            { ctime: Date.now(), text, user },
            ...prev.messages
          ]
        })
    )
  }, [defaultChatroom, defaultU, setChatroom])
  const editMessage = useCallback((index: number, text: string) => {
    setChatroom(prev => {
      if (!prev) return defaultChatroom
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
