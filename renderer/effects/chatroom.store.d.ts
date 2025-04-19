declare module 'spirit' {
  export type ITool = {
    type: 'function' | (string & {})
    function: {
      name: string
      description: string
      parameters: {
        type: string
        required: string[]
        properties: {
          [key: string]: {
            type?: string
            description?: string
            enum?: string[]
          }
        }
      }
      strict?: boolean
    }
  }
  export type IToolCall = {
    id?: string
    function?: {
      name?: string
      arguments?: {
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
      type?: 'system' | 'tool' | 'developer' | 'assistant' | 'user' | '__spirit:system__' | (string & {})
      text?: string
      assets?: Asset[]
      hidden?: boolean
      ctime: Date | number | string
      nexts?: IMessage[][]
      toolCalls?: IToolCall[]
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
    /**
     * 覆盖系统提示词
     */
    overrideSystemPrompt?: string
    /**
     * 一条会被隐藏的消息，它会作为机器人的第一条回复而被提交到服务器请求
     */
    firstBotMessage?: string

    maxMessages?: number
    sessionLength?: number

    tools?: string[]
    enableTools?: boolean

    aiService?: {
      uuid: string
      options?: AIServiceOptions
    }

    bot?: {
      uuid: string
      options?: BotOptions
    }
  }
  export interface ChatRoom {
    id: string
    name?: string
    description?: string
    messages: IMessage[] | null

    options?: ChatRoomOptions
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
