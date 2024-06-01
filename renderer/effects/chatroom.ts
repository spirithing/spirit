import { getActiveChatroom, getChatroom } from '../hooks/useChatroom'
import { subAtomByKey } from '../hooks/useStore'
import { ee } from '../store'
import { diff } from '../utils/diff'

let unSub: () => void
let chatroomID = getActiveChatroom()
let chatroom = getChatroom()
let { messages } = chatroom
function subChatroom() {
  unSub?.()
  return subAtomByKey(`chatroom:${chatroomID}`, () => {
    chatroom = getChatroom()
    const { messages: newMessages } = chatroom
    const { adds, dels } = diff(messages, newMessages)
    ee.emit('changeChatroom', chatroomID, chatroom)
    messages = newMessages
    adds.forEach(m => ee.emit('addMessage', m, chatroom))
    dels.forEach(m => ee.emit('delMessage', m, chatroom))
  })
}
unSub = subChatroom()
subAtomByKey('activeChatroom', () => {
  chatroomID = getActiveChatroom()
  chatroom = getChatroom()
  ;({ messages } = chatroom)
  unSub = subChatroom()
})
