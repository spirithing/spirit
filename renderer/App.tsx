import './App.scss'

import MarkdownItPluginShiki from '@shikijs/markdown-it'
import MarkdownIt from 'markdown-it'
import OpenAI from 'openai'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Bot } from 'spirit'
import { DialogPlugin, Input, MessagePlugin, Select, Tabs, Textarea } from 'tdesign-react'

import type { IMessage } from './components/Message'
import { Message } from './components/Message'
import { Sender } from './components/Sender'
import { Base } from './configurers/Base'
import { useElectronStore } from './store'
import { classnames } from './utils/classnames'

type MessageItem = IMessage & {
  hidden?: boolean
}

const defaultBot = {
  name: '器灵',
  description:
    '一个 AI 助手，中文环境下的分类为器灵，英文环境下的分类为 Spirit。通过快捷入口触发，帮助用户解决问题，也可以陪用户聊天。\n'
    + '器灵的中文意义是「器物的灵魂」，万物皆有灵，那么电脑的灵便是 AI 了。'
} satisfies Bot

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

  const [user] = useElectronStore('user')

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

  const [_bot, setBot] = useElectronStore('bot')
  const bot = useMemo(() => _bot ?? defaultBot, [_bot])
  const [messages, setMessages] = useState<MessageItem[]>([])
  const sendMessage = async (message: string, dispatch: (text: string) => void) => {
    if (!user) {
      MessagePlugin.error('User not initialized')
      return
    }
    const newMessages = [
      {
        text: message,
        user,
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
    if (!bot) {
      alert('Bot not initialized')
      return
    }
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
        ...newMessages.map(messageTransform.bind(null, bot)).reverse()
      ],
      stream: true
    })
    newMessages.unshift({
      text: '',
      user: bot,
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

  const [configDrawerVisible, setConfigDrawerVisible] = useState(false)
  return <>
    <div className='spirit-main'>
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
        onIconClick={() => setConfigDrawerVisible(v => !v)}
        Footer={
          <Tabs
            className={classnames('spirit-configurer-panel', {
              'spirit-configurer-panel--visible': configDrawerVisible
            })}
            defaultValue='base'
          >
            <Tabs.TabPanel
              value='base'
              label={Base.Title}
            >
              <Base />
            </Tabs.TabPanel>
            <Tabs.TabPanel
              value='ai'
              label={
                <>
                  <span className='s-icon'>robot</span>&nbsp;AI
                </>
              }
            >
              <div className='spirit-field'>
                <label>API Key</label>
                <Input
                  value={config ? config.apiKey : ''}
                  onChange={v => setConfig({ ...config, apiKey: v })}
                  type='password'
                  // @ts-ignore
                  spellCheck={false}
                />
              </div>
              <div className='spirit-field'>
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
            </Tabs.TabPanel>
            <Tabs.TabPanel
              value='bot'
              label={
                <>
                  <span className='s-icon'>smart_toy</span>&nbsp;Bot
                </>
              }
            >
              <div className='spirit-field'>
                <label>Name</label>
                <Input
                  value={bot?.name}
                  onChange={v => setBot({ ...bot!, name: v })}
                />
              </div>
              <div className='spirit-field'>
                <label>Bot</label>
                <Textarea
                  value={bot?.description}
                  onChange={v => setBot({ ...bot!, description: v })}
                  autosize={{
                    maxRows: 6,
                    minRows: 2
                  }}
                />
              </div>
            </Tabs.TabPanel>
          </Tabs>
        }
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
    </div>
  </>
}
