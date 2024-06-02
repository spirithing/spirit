declare module 'spirit' {
  export type IMessage = {
    text: string
    user?: IUser
    hidden?: boolean
    ctime: Date | number | string
    nexts?: IMessage[][]
  }
  export interface ChatRoom {
    id: string
    name?: string
    description?: string
    messages: IMessage[] | null
  }
  export interface Store {
    activeChatroom: string
    chatrooms: string[]
    [k: `chatroom:${string}`]: ChatRoom
  }
}
