import './Configurer.scss'

import { Sketch } from '@uiw/react-color'
import type { FC, ReactNode } from 'react'
import { Translation, useTranslation } from 'react-i18next'
import type { BundledTheme } from 'shiki'
import { bundledThemes } from 'shiki'
import { Col, Input, Link, Row, Select, Tabs, Textarea, Tooltip } from 'tdesign-react'

import { KbdRecorder } from '#renderer/components/KbdRecorder.tsx'
import { AIServices } from '#renderer/configurers/AIServices.tsx'
import { Base } from '#renderer/configurers/Base.tsx'
import { Chatroom } from '#renderer/configurers/Chatroom.tsx'
import { useBot } from '#renderer/hooks/useBot.ts'
import { useElectronStore } from '#renderer/hooks/useStore.ts'
import { useThemeStore } from '#renderer/providers/theme.tsx'

function Theme() {
  const { t } = useTranslation()
  const [themeStore, setThemeStore] = useThemeStore()
  return <>
    <Row gutter={12}>
      <Col span={4}>
        <div className='spirit-field'>
          <label>{t('primaryColor')}</label>
          <Sketch
            style={{ width: '100%' }}
            presetColors={[
              '#f5222d',
              '#fa541c',
              '#fa8c16',
              '#faad14',
              '#fadb14',
              '#a0d911',
              '#52c41a',
              '#13c2c2',
              '#1890ff',
              '#2f54eb',
              '#722ed1',
              '#eb2f96',
              '#000000',
              '#4A4A4A',
              '#9B9B9B',
              '#FFFFFF'
            ]}
            color={Array.isArray(themeStore.colors?.primary)
              ? themeStore.colors?.primary[0]
              : themeStore.colors?.primary}
            onChange={r => {
              setThemeStore({
                ...themeStore,
                colors: {
                  ...themeStore.colors,
                  primary: r.hex
                }
              })
            }}
          />
        </div>
      </Col>
      <Col span={4}>
        <div className='spirit-field'>
          <label>{t('highlight')}</label>
          <Select
            filterable
            options={Object.keys(bundledThemes).map((label) => ({
              label,
              value: label
            }))}
            value={themeStore?.highlightTheme}
            onChange={v => setThemeStore({ ...themeStore, highlightTheme: v as BundledTheme })}
          />
        </div>
        <div className='spirit-field'>
          <label>{t('highlightDark')}</label>
          <Select
            filterable
            options={Object.keys(bundledThemes).map((label) => ({
              label,
              value: label
            }))}
            value={themeStore?.highlightThemeWhenDark}
            onChange={v => setThemeStore({ ...themeStore, highlightThemeWhenDark: v as BundledTheme })}
          />
        </div>
      </Col>
    </Row>
  </>
}

function Shortcuts() {
  const { t } = useTranslation()
  const [shortcuts, setShortcuts] = useElectronStore('shortcuts')
  return <>
    <Row gutter={12}>
      <Col span={3}>
        <div className='spirit-field'>
          <label>{t('startShortcut')}</label>
          <KbdRecorder
            resettable
            defaultValue={shortcuts?.start && shortcuts.start.length > 0
              ? shortcuts.start
              : ['opt', 'space']}
            onRecordEnd={v => {
              if (!v) return

              setShortcuts({ ...shortcuts, start: v })
            }}
          />
          <Tooltip
            content={
              <>
                {/* TODO */}
                Open your system preferences and set a global shortcut for this action.
              </>
            }
          >
            <Link className='spirit-field__desc'>{t('startShortcutDesc')}</Link>
          </Tooltip>
        </div>
      </Col>
      <Col span={9}>
        <div className='spirit-field'>
          <label>{t('filteredApplications')}</label>
          {/* TODO */}
        </div>
      </Col>
    </Row>
    <Row gutter={12}>
      <Col span={12}>
        <div className='spirit-field'>
          <label>{t('shortcuts')}</label>
          <Row gutter={12}>
            <Col span={3}>
              <KbdRecorder
                resettable
                defaultValue={shortcuts?.send && shortcuts.send.length > 0
                  ? shortcuts.send
                  : ['enter']}
                onRecordEnd={v => {
                  if (!v) return

                  setShortcuts({
                    ...shortcuts,
                    send: v.map(k => ({
                      NumpadEnter: 'Enter'
                    }[k] ?? k))
                  })
                }}
              />
              <Link className='spirit-field__desc'>{t('shortcut.sendDesc')}</Link>
            </Col>
          </Row>
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
    icon: 'palette',
    value: 'theme',
    title: <Translation>{t => t('theme')}</Translation>,
    Configurer: Theme
  },
  {
    icon: 'keyboard',
    value: 'shortcuts',
    title: <Translation>{t => t('shortcuts')}</Translation>,
    Configurer: Shortcuts
  },
  {
    icon: 'robot',
    value: 'aiServices',
    title: <Translation>{t => t('aiServices')}</Translation>,
    Configurer: AIServices
  },
  {
    icon: 'forum',
    value: 'chatroom',
    title: <Translation>{t => t('chatroom')}</Translation>,
    Configurer: Chatroom
  },
  {
    icon: 'smart_toy',
    value: 'bot',
    title: <Translation>{t => t('bot')}</Translation>,
    Configurer: Bot
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
