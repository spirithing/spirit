import './Configurer.scss'

import { Input, Select, Tabs, Textarea } from 'tdesign-react'

import { Base } from '../configurers/Base'
import { useBot } from '../hooks/useBot'
import { useElectronStore } from '../hooks/useStore'

export function Configurer() {
  const [bot, setBot] = useBot()
  const [config, setConfig] = useElectronStore('openaiConfig')

  return <Tabs
    className='spirit-configurer-panel'
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
