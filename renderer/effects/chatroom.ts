import { getActiveChatroom, getChatroom } from '../hooks/useChatroom'
import { ee, subAtomByKey } from '../store'

function diff<T>(a: T[], b: T[]): {
  adds: T[]
  dels: T[]
  exist: [oldIndex: number, newIndex: number, T][]
} {
  const adds: T[] = []
  const dels: T[] = []
  const exist: [number, number, T][] = []
  const map = new Map<T, number>()
  a.forEach((v, i) => map.set(v, i))
  b.forEach((v, i) => {
    const oldIndex = map.get(v)
    if (oldIndex === undefined) {
      adds.push(v)
    } else {
      exist.push([oldIndex, i, v])
    }
  })
  a.forEach(v => {
    if (!b.includes(v)) dels.push(v)
  })
  return { adds, dels, exist }
}

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
