import { electronStore, keyAtom } from '../store'

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
