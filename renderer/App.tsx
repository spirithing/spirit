import './App.scss'

import MarkdownItPluginShiki from '@shikijs/markdown-it'
import MarkdownIt from 'markdown-it'
import OpenAI from 'openai'
import { useEffect, useRef, useState } from 'react'
import { Card, DialogPlugin, Input, Select } from 'tdesign-react'

import type { IMessage, IUser } from './components/Message'
import { Message } from './components/Message'
import { Sender } from './components/Sender'
import { useElectronStore } from './store'

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
    name: '器灵',
    avatar: `${import.meta.env.BASE_URL}public/favicon.svg`,
    description:
      '一个 AI 助手，中文环境下的分类为器灵，英文环境下的分类为 Spirit。通过快捷入口触发，帮助用户解决问题，也可以陪用户聊天。\n'
      + '器灵的中文意义是「器物的灵魂」，万物皆有灵，那么电脑的灵便是 AI 了。'
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

  const [displaying] = useElectronStore('display')
  useEffect(() => {
    document.body.classList.toggle('displaying', !!displaying)
    return () => {
      document.body.classList.remove('displaying')
    }
  }, [displaying])
  const [config, setConfig] = useElectronStore('openaiConfig')
  const openaiRef = useRef<OpenAI | null>(null)
  function createOpenAI() {
    if (!config || !config.apiKey || !config.baseURL) return
    openaiRef.current = new OpenAI({
      ...config,
      dangerouslyAllowBrowser: true
    })
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
    const latestMessage = newMessages[0]
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
      onClear={() => {
        const ins = DialogPlugin.confirm({
          header: 'Clear all messages',
          body: 'Are you sure to clear all messages?',
          onConfirm() {
            setMessages([])
            ins.hide()
          },
          onClose: () => ins.hide()
        })
      }}
    />
    <Card>
      <div className='config'>
        <div className='config-item'>
          <label>API Key</label>
          <Input
            value={config ? config.apiKey : ''}
            onChange={v => setConfig({ ...config, apiKey: v })}
          />
        </div>
        <div className='config-item'>
          <label>Base URL</label>
          <Select
            filterable
            creatable
            options={[
              { label: 'OpenAI', value: 'https://api.openai.com/v1' },
              { label: 'AIProxy', value: 'https://api.aiproxy.io/v1' }
            ]}
            value={config ? config.baseURL ?? '' : ''}
            onChange={v => setConfig({ ...config, baseURL: v as string })}
          />
        </div>
      </div>
    </Card>
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
