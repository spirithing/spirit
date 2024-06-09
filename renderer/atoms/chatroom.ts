import { ChatRoom, IUser } from 'spirit'
import { electronStore, keyAtom } from '../store'
import { uuid } from '../utils/uuid'

export const getActiveChatroomAtom = () => keyAtom('activeChatroom')
export const getActiveChatroom = () => {
  const activeChatroomAtom = getActiveChatroomAtom()
  return activeChatroomAtom
    ? electronStore.get(activeChatroomAtom) ?? 'default'
    : 'default'
}
export const getChatroomAtom = (
  id = getActiveChatroom()
) => keyAtom(`chatroom:${id}`)
export const getChatroom = (
  id = getActiveChatroom()
) => {
  const chatroomAtom = getChatroomAtom(id)
  const empty = { id, messages: null }
  if (chatroomAtom === undefined) {
    return empty
  }
  return electronStore.get(chatroomAtom) ?? empty
}
export const setChatroom = (id: string, chatroomOrSetter: ChatRoom | ((chatroom: ChatRoom) => ChatRoom)) => {
  const chatroomAtom = getChatroomAtom(id)
  if (!chatroomAtom) {
    throw new Error('Chatroom not found')
  }

  const chatroom = typeof chatroomOrSetter === 'function'
    ? chatroomOrSetter(getChatroom(id))
    : chatroomOrSetter
  electronStore.set(chatroomAtom, chatroom)
}
export const sendMessage = (id: string, text: string, user: IUser) => {
  const message = { uuid: uuid(), ctime: Date.now(), text, user }
  setChatroom(id, chatroom => ({
    ...chatroom,
    messages: [message, ...(chatroom.messages ?? [])]
  }))
  return message
}
export const editMessage = (id: string, index: number | string, text: string) => {
  setChatroom(id, chatroom => {
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
    messages[index] = { ...messages[index], text }
    return { ...chatroom, messages }
  })
}
