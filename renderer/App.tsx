import './App.scss'

import { useEffect, useState } from 'react'
import { Input, Select, Tabs, Textarea } from 'tdesign-react'

import { Message } from './components/Message'
import { Sender } from './components/Sender'
import { Base } from './configurers/Base'
import { useBot } from './hooks/useBot'
import { useChatroom } from './hooks/useChatroom'
import { useMDRender } from './hooks/useMDRender'
import { useElectronStore } from './hooks/useStore'
import { classnames } from './utils/classnames'

function Messages() {
  const mdRef = useMDRender()
  const [{ messages }] = useChatroom()

  return <div className='messages'>
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
}

export function App() {
  const [displaying] = useElectronStore('display')
  useEffect(() => {
    document.body.classList.toggle('displaying', !!displaying)
    return () => {
      document.body.classList.remove('displaying')
    }
  }, [displaying])

  const [bot, setBot] = useBot()
  const [config, setConfig] = useElectronStore('openaiConfig')

  const [configDrawerVisible, setConfigDrawerVisible] = useState(false)
  return <>
    <div className='spirit-main'>
      <Sender
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
      <Messages />
    </div>
  </>
}
