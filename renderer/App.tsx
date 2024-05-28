import './App.scss'

import MarkdownItPluginShiki from '@shikijs/markdown-it'
import MarkdownIt from 'markdown-it'
import type { ClientOptions } from 'openai'
import OpenAI from 'openai'
import { useRef, useState } from 'react'

import type { IMessage, IUser } from './components/Message'
import { Message } from './components/Message'
import { Sender } from './components/Sender'

type MessageItem = IMessage & {
  hidden?: boolean
}

const currentUser = {
  name: 'YiJie'
} as IUser
type Bot = IUser & {
  description: string
}
const bots = {
  documentHelper: {
    name: 'Document Helper Bot',
    avatar: `${import.meta.env.BASE_URL}public/favicon.svg`,
    description:
      'A bot that helps you document your to code. The shikitor is a editor that supports markdown and code highlighting.'
  }
} satisfies Record<string, Bot>

function messageTransform(bot: Bot, m: MessageItem): OpenAI.ChatCompletionMessageParam {
  const isBot = m.user?.name === bot.name
  return {
    role: isBot ? 'assistant' : 'user',
    content: `${isBot ? '' : `${m.user?.name}:\n`}${m.text}`
  }
}

export function App() {
  const mdRef = useRef<MarkdownIt>()
  if (!mdRef.current) {
    mdRef.current = MarkdownIt()
    MarkdownItPluginShiki({
      themes: {
        light: 'github-light'
      }
    }).then(plugin => mdRef.current?.use(plugin))
  }

  const storageConfig = JSON.parse(
    localStorage.getItem('openai-config') ?? '{ "baseURL": "https://api.openai.com/v1" }'
  )
  const [config, setConfig] = useState(
    {
      ...storageConfig,
      dangerouslyAllowBrowser: true
    } as ClientOptions
  )
  const openaiRef = useRef<OpenAI | null>(null)
  function createOpenAI() {
    if (!config.apiKey || !config.baseURL) return
    openaiRef.current = new OpenAI(config)
  }
  openaiRef.current === null && createOpenAI()

  const [messages, setMessages] = useState<MessageItem[]>([])
  const sendMessage = async (message: string, dispatch: (text: string) => void) => {
    const newMessages = [
      {
        text: message,
        user: currentUser,
        ctime: Date.now()
      },
      ...messages
    ] satisfies MessageItem[]
    setMessages(newMessages)
    dispatch('')
    if (!openaiRef.current) {
      alert('OpenAI not initialized')
      return
    }
    const bot = bots.documentHelper
    const completions = await openaiRef.current.chat.completions.create({
      model: 'gpt-4o',
      // eslint-disable-next-line camelcase
      max_tokens: 4096,
      messages: [
        {
          content: `Your name is "${bot.name}" and your description is "${bot.description}".\n`
            + 'Every message except yours has a corresponding username, in the format where the current message username appears at the beginning of each message.',
          role: 'system'
        },
        ...newMessages.map(messageTransform.bind(null, bots.documentHelper))
      ],
      stream: true
    })
    newMessages.unshift({
      text: '',
      user: bots.documentHelper,
      ctime: Date.now()
    })
    const latestMessage = newMessages[newMessages.length - 1]
    let streamMessage = ''
    for await (const { choices: [{ delta }] } of completions) {
      streamMessage += delta.content ?? ''
      latestMessage.text = streamMessage
      setMessages([...newMessages])
    }
  }

  return <>
    <Sender
      onSend={sendMessage}
    />
    <div className='messages'>
      {messages.map((message, i) => (
        <Message
          key={i}
          value={message}
          textRender={text => (
            <div className='message-text'>
              <div
                className='s-md'
                dangerouslySetInnerHTML={{
                  __html: mdRef.current?.render(text) ?? ''
                }}
              />
            </div>
          )}
        />
      ))}
    </div>
  </>
}
