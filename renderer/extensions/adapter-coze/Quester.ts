import { parseJSON } from '../../utils/parseJSON'

export interface CozeQuesterConfig {
  apiHost: string
  bearerToken: string
}

export type CozeQuesterMessage =
  & {
    content: string
    contentType?: 'text'
    extraInfo?: object | null
  }
  & (
    | {
      role: 'user'
    }
    | {
      role: 'assistant'
      type: 'answer' | 'function_call' | 'tool_response' | 'follow_up'
    }
  )

export interface CozeQuesterChatReq {
  botID: string
  conversationID?: string
  user: string
  query: string
  chatHistory?: CozeQuesterMessage[]
  stream: boolean
  customVariables?: Record<string, string>
}

export interface CozeQuesterChatMessageSnake {
  role: string
  type: string
  content: string
  content_type: string
  extra_info?: object | null
}

export interface CozeQuesterChatRespSnake {
  messages: CozeQuesterChatMessageSnake[]
  conversation_id: string
  code: 0
  msg: 'success'
}

export type CozeQuesterChatRespIterItemSnake =
  | { event: 'done' }
  | {
    event: 'message'
    is_finish: boolean
    index: number
    conversation_id: string
    seq_id: number
    message: CozeQuesterChatMessageSnake
  }
  | {
    event: 'error'
    error_information: {
      code: number
      msg: string
    }
  }

export interface CozeQuesterChatMessage {
  role: string
  type: string
  content: string
  contentType: string
  extraInfo?: object | null
}

export interface CozeQuesterChatResp {
  messages: CozeQuesterChatMessage[]
  conversationID: string
  code: 0
  msg: 'success'
}

export type CozeQuesterChatRespIterItem =
  | { event: 'done' }
  | {
    event: 'message'
    isFinish: boolean
    index: number
    conversationID: string
    seqID: number
    message: CozeQuesterChatMessage
  }
  | {
    event: 'error'
    errorInformation: {
      code: number
      msg: string
    }
  }

export interface ErrorResponse {
  code: number
  msg: string
}

export default class CozeQuester {
  private apiHost: CozeQuesterConfig['apiHost']
  private defaultHeaders: Record<string, string> = {}
  constructor(
    config: CozeQuesterConfig
  ) {
    this.apiHost = config.apiHost
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Host: 'api.coze.cn',
      Connection: 'keep-alive',
      Authorization: `Bearer ${config.bearerToken}`
    }
  }

  chat(req: CozeQuesterChatReq & { stream: true }): Promise<AsyncGenerator<CozeQuesterChatRespIterItem>>
  chat(req: CozeQuesterChatReq & { stream?: false }): Promise<CozeQuesterChatResp>
  async chat(
    req: CozeQuesterChatReq
  ): Promise<CozeQuesterChatResp | AsyncGenerator<CozeQuesterChatRespIterItem>> {
    req.stream = req.stream ?? false
    const resp = await fetch(`${this.apiHost}/chat`, {
      method: 'POST',
      headers: {
        ...this.defaultHeaders
      },
      body: JSON.stringify({
        /* eslint-disable camelcase */
        bot_id: req.botID,
        conversation_id: req.conversationID,
        user: req.user,
        query: req.query,
        chat_history: req.chatHistory?.map(m => {
          const common = {
            role: m.role,
            content: m.content,
            content_type: m.contentType,
            extra_info: m.extraInfo
          }
          if (m.role === 'user') {
            return common
          }
          if (m.role === 'assistant') {
            return {
              ...common,
              type: m.type
            }
          }
          throw new Error('Invalid role')
        }),
        stream: req.stream,
        custom_variables: req.customVariables
        /* eslint-enable camelcase */
      })
    })
    if (!resp.body) {
      throw new Error('Missing body')
    }
    const itr = parseJSON(resp.body, text => {
      const jsonStr = text.replace(/^data:/, '')
      return JSON.parse(jsonStr)
    })
    if (req.stream) {
      const iterator = itr as AsyncGenerator<
        CozeQuesterChatRespIterItemSnake,
        ErrorResponse
      >
      return (async function*() {
        do {
          const message = await iterator.next()
          if (message.done) {
            if (message.value.code === 0) {
              yield { event: 'done' } satisfies CozeQuesterChatRespIterItem
            } else {
              yield {
                event: 'error',
                errorInformation: message.value
              } satisfies CozeQuesterChatRespIterItem
            }
            return
          }
          const item = message.value

          if (item.event === 'done') {
            yield { event: item.event } satisfies CozeQuesterChatRespIterItem
            return
          }
          if (item.event === 'error') {
            yield { event: item.event, errorInformation: item.error_information } satisfies CozeQuesterChatRespIterItem
            return
          }
          const {
            event,
            message: {
              role,
              type,
              content,
              content_type: contentType,
              extra_info: extraInfo,
              ...restMessage
            },
            is_finish: isFinish,
            index,
            conversation_id: conversationID,
            seq_id: seqID,
            ...rest
          } = item
          yield {
            message: { role, type, content, contentType, extraInfo, ...restMessage },
            event,
            isFinish,
            index,
            conversationID,
            seqID,
            ...rest
          } satisfies CozeQuesterChatRespIterItem
        } while (true)
      })()
    } else {
      const iterator = itr as AsyncGenerator<unknown, CozeQuesterChatRespSnake | ErrorResponse>
      const message = await iterator.next()
      if (!message.done) {
        throw new Error('Unexpected response')
      }
      if (message.value.code === 0) {
        const value = message.value as CozeQuesterChatRespSnake
        return {
          messages: value.messages.map(m => ({
            role: m.role,
            type: m.type,
            content: m.content,
            contentType: m.content_type,
            extraInfo: m.extra_info
          })),
          conversationID: value.conversation_id,
          code: value.code,
          msg: value.msg
        }
      } else {
        throw new Error(`[${message.value.code}] ${message.value.msg}`)
      }
    }
  }
}
