declare module 'spirit' {
  import OpenAI from 'openai'
  import ChatModel = OpenAI.ChatModel

  export type Asset = {
    type: 'image'
    url: string
  }
  export type IMessage =
    & {
      uuid: string
      user?: IUser
      text?: string
      assets?: Asset[]
      hidden?: boolean
      ctime: Date | number | string
      nexts?: IMessage[][]
    }
    & (
      | {
        text: string
        assets: undefined
      }
      | {
        text?: string
        assets: Asset[]
      }
    )
  export interface ChatRoomOptions {
    model?: (string & {}) | ChatModel
    sessionLength?: number
    maxMessages?: number
  }
  export interface ChatRoom {
    id: string
    name?: string
    description?: string
    options?: ChatRoomOptions
    messages: IMessage[] | null
  }
  export interface Store {
    activeChatroom: string
    chatrooms: string[]
    [k: `chatroom:${string}`]: ChatRoom
    // TODO
    // [k: `messages:${string}`]: IMessage[]
  }
}
