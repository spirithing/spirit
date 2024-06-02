declare module 'spirit' {
  import OpenAI from 'openai'
  import ChatModel = OpenAI.ChatModel

  export type IMessage = {
    text: string
    user?: IUser
    hidden?: boolean
    ctime: Date | number | string
    nexts?: IMessage[][]
  }
  export interface ChatRoomOptions {
  }
  export interface ChatRoom {
    id: string
    name?: string
    description?: string
    options?: {
      model?: (string & {}) | ChatModel
      sessionLength?: number
      maxMessages?: number
    }
    messages: IMessage[] | null
  }
  export interface Store {
    activeChatroom: string
    chatrooms: string[]
    [k: `chatroom:${string}`]: ChatRoom
  }
}