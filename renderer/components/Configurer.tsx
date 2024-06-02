import './Configurer.scss'

import type { FC, ReactNode } from 'react'
import { Translation } from 'react-i18next'
import { Input, Select, Tabs, Textarea } from 'tdesign-react'

import { Base } from '../configurers/Base'
import { useBot } from '../hooks/useBot'
import { useElectronStore } from '../hooks/useStore'

function OpenAI() {
  const [config, setConfig] = useElectronStore('openaiConfig')
  return <>
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
  </>
}

function Bot() {
  const [bot, setBot] = useBot()
  return <>
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
  </>
}

interface ConfigurerTab {
  group?: ReactNode
  value: string
  icon?: string
  title: ReactNode
  Configurer?: FC
}

const tabs = [
  {
    icon: 'settings',
    value: 'common',
    title: <Translation>{t => t('common')}</Translation>,
    Configurer: Base
  },
  {
    icon: 'robot',
    value: 'openAI',
    title: 'OpenAI',
    Configurer: OpenAI
  },
  {
    icon: 'smart_toy',
    value: 'bot',
    title: <Translation>{t => t('bot')}</Translation>,
    Configurer: Bot
  },
  {
    icon: 'palette',
    value: 'theme',
    title: <Translation>{t => t('theme')}</Translation>
  },
  {
    icon: 'forum',
    value: 'chatroom',
    title: <Translation>{t => t('chatroom')}</Translation>
  }
] satisfies ConfigurerTab[]

export function Configurer() {
  return <Tabs
    className='spirit-configurer-panel'
    defaultValue={tabs[0].value}
  >
    {tabs.map(tab =>
      <Tabs.TabPanel
        key={tab.value}
        value={tab.value}
        label={
          <>
            {tab.icon && <>
              <span className='s-icon'>{tab.icon}</span>&nbsp;
            </>}
            {tab.title}
          </>
        }
      >
        {tab.Configurer && <tab.Configurer />}
      </Tabs.TabPanel>
    )}
  </Tabs>
}
