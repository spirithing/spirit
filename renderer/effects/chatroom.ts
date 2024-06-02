import { getActiveChatroom, getChatroom } from '../atoms/chatroom'
import { subAtomByKey } from '../atoms/keys'
import { ee } from '../instances/ee'
import { diff } from '../utils/diff'

let unSub: () => void
let chatroomID = getActiveChatroom()
let chatroom = getChatroom()
let { messages } = chatroom
function subChatroom() {
  unSub?.()
  return subAtomByKey(`chatroom:${chatroomID}`, () => {
    chatroom = getChatroom()
    const oldMessages = messages
    const { messages: newMessages } = chatroom
    messages = newMessages
    ee.emit('changeChatroom', chatroomID, chatroom)
    if (oldMessages !== null) {
      const { adds, dels } = diff(oldMessages, newMessages ?? [])
      adds.forEach(m => ee.emit('addMessage', m, chatroom))
      dels.forEach(m => ee.emit('delMessage', m, chatroom))
    }
  })
}
unSub = subChatroom()
const unSubActiveChatroomChange = subAtomByKey('activeChatroom', () => {
  chatroomID = getActiveChatroom()
  chatroom = getChatroom()
  ;({ messages } = chatroom)
  unSub = subChatroom()
})
if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    unSub()
    unSubActiveChatroomChange()
  })
}
