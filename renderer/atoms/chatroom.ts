import { electronStore, keyAtom } from '../store'

export const getActiveChatroomAtom = () => keyAtom('activeChatroom')
export const getActiveChatroom = () =>
  getActiveChatroomAtom()
    ? electronStore.get(getActiveChatroomAtom()) ?? 'default'
    : 'default'
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
