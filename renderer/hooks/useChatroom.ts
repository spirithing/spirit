import { useCallback, useMemo } from 'react'
import type { IUser } from 'spirit'

import { keyAtom, useElectronStore } from '../store'
import { electronStore } from '../store.init'
import { useUser } from './useUser'

export const activeChatroomAtom = () => keyAtom('activeChatroom')
export const getActiveChatroom = () =>
  activeChatroomAtom()
    ? electronStore.get(activeChatroomAtom()) ?? 'default'
    : 'default'
export const getChatroomAtom = (
  id = getActiveChatroom()
) => keyAtom(`chatroom:${id}`)
export const getChatroom = (
  id = getActiveChatroom()
) => (
  electronStore.get(getChatroomAtom(id)) ?? { id, messages: [] }
)

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
      prev
        ? ({
          ...prev,
          messages: [
            { ctime: Date.now(), text, user },
            ...prev.messages
          ]
        })
        : defaultChatroom
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
      prev
        ? ({ ...prev, messages: [] })
        : defaultChatroom
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
