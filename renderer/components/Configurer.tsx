import './Configurer.scss'

import type { FC, ReactNode } from 'react'
import { Translation, useTranslation } from 'react-i18next'
import { Col, Input, Row, Select, Tabs, Textarea } from 'tdesign-react'

import { Base } from '../configurers/Base'
import { useBot } from '../hooks/useBot'
import { useChatroom } from '../hooks/useChatroom'
import { useElectronStore } from '../hooks/useStore'
import { ModelSelector } from './selectors/ModelSelector'

function OpenAI() {
  const { t } = useTranslation()
  const [config, setConfig] = useElectronStore('openaiConfig')
  return <>
    <Row gutter={12}>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('apiBaseUrl')}</label>
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
      </Col>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('apiKey')}</label>
          <Input
            value={config ? config.apiKey : ''}
            onChange={v => setConfig({ ...config, apiKey: v })}
            type='password'
            // @ts-ignore
            spellCheck={false}
          />
        </div>
      </Col>
    </Row>
  </>
}

function Bot() {
  const { t } = useTranslation()
  const [bot, setBot] = useBot()
  return <>
    <Row gutter={12}>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('name')}</label>
          <Input
            value={bot?.name}
            onChange={v => setBot({ ...bot!, name: v })}
          />
        </div>
      </Col>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('desc')}</label>
          <Textarea
            value={bot?.description}
            onChange={v => setBot({ ...bot!, description: v })}
            autosize={{
              maxRows: 6,
              minRows: 2
            }}
          />
        </div>
      </Col>
    </Row>
  </>
}

function Chatroom() {
  const { t } = useTranslation()
  const [chatroom, { setChatroom }] = useChatroom()
  return <>
    <Row gutter={12}>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('name')}</label>
          <Input
            value={chatroom?.name}
            onChange={v => setChatroom({ ...chatroom!, name: v })}
          />
        </div>
        <div className='spirit-field'>
          <label>{t('model')}</label>
          <ModelSelector
            value={chatroom?.options?.model}
            onChange={v => setChatroom({ ...chatroom!, options: { ...chatroom?.options, model: v } })}
          />
        </div>
      </Col>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('desc')}</label>
          <Textarea
            value={chatroom?.description}
            onChange={v => setChatroom({ ...chatroom!, description: v })}
            autosize={{ minRows: 1, maxRows: 6 }}
          />
        </div>
      </Col>
    </Row>
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
    title: <Translation>{t => t('chatroom')}</Translation>,
    Configurer: Chatroom
  },
  {
    icon: 'verified_user',
    value: 'permissions',
    title: <Translation>{t => t('permissions')}</Translation>
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
