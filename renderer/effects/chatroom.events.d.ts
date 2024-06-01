declare module 'spirit' {
  export interface Events {
    changeChatroom: (id: string, chatroom: ChatRoom) => void
    addMessage: (message: IMessage, chatroom: ChatRoom) => void
    delMessage: (message: IMessage, chatroom: ChatRoom) => void
  }
}
