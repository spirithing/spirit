declare module 'spirit' {
  export type IToolCall = {
    id: string
    function: {
      name: string
      arguments: {
        [key: string]: any
      }
    }
  }
  export type Asset = {
    type: 'image'
    url: string
  }
  export type IMessage =
    & {
      uuid: string
      user?: IUser
      type?: 'system' | 'tool' | 'developer' | 'assistant' | 'user' | (string & {})
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
    aiServiceUUID?: string
    model?: string
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
    chatroomMetas: {
      [k: string]: Pick<ChatRoom, 'name' | 'description'>
    }
    [k: `chatroom:${string}`]: ChatRoom
    // TODO
    // [k: `messages:${string}`]: IMessage[]
  }
}
