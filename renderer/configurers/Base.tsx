import './Base.scss'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Col, Input, Row, Select } from 'tdesign-react'

import { useElectronStore } from '../hooks/useStore'
import { useUser } from '../hooks/useUser'
import { bundledLocales } from '../providers/i18n'
import { classnames } from '../utils/classnames'

function ThemeSwitcher() {
  const { t } = useTranslation()
  const prefix = 'spirit-theme-switcher'
  const [common, setCommon] = useElectronStore('common')
  const theme = common?.theme ?? 'auto'
  return <div
    className={prefix}
    onClick={e => {
      const target = e.target as HTMLElement
      const card = target.closest('.t-card')
      if (!card) return
      const theme = card.classList.contains('light')
        ? 'light'
        : card.classList.contains('dark')
        ? 'dark'
        : 'auto'
      setCommon({ ...common!, theme })
    }}
  >
    <Card
      size='small'
      hoverShadow
      className={classnames('light', theme === 'light' ? `${prefix}--active` : '')}
      header={<span className='s-icon'>light_mode</span>}
    >
      {t('themeLight')}
    </Card>
    <Card
      size='small'
      hoverShadow
      className={classnames('dark', theme === 'dark' ? `${prefix}--active` : '')}
      header={<span className='s-icon'>dark_mode</span>}
    >
      {t('themeDark')}
    </Card>
    <Card
      size='small'
      hoverShadow
      className={classnames('auto', theme === 'auto' ? `${prefix}--active` : '')}
      header={<span className='s-icon'>auto_awesome</span>}
    >
      {t('themeAuto')}
    </Card>
  </div>
}

export function Base() {
  const [system] = useElectronStore('system')
  const [common, setCommon] = useElectronStore('common', {
    locale: 'system'
  })
  const { t, i18n } = useTranslation()
  useEffect(() => {
    if (common?.locale === 'system') {
      // TODO
      // i18n.changeLanguage(system?.locale ?? navigator.language)
      i18n.changeLanguage(navigator.language)
    } else {
      i18n.changeLanguage(common?.locale)
    }
  }, [common?.locale, i18n])
  const [user, setUser] = useUser()
  return <>
    <Row gutter={12}>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('locale')}</label>
          <Select
            options={[
              { label: 'System', value: 'system' },
              ...bundledLocales.map(locale => ({ label: locale, value: locale }))
            ]}
            value={common!.locale}
            onChange={v => setCommon({ ...common!, locale: v as string })}
          />
        </div>
      </Col>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('name')}</label>
          <Input
            value={user?.name}
            onChange={v => setUser({ ...user, name: v })}
            suffix={
              <Button
                style={{ marginRight: -10 }}
                shape='square'
                variant='text'
                onClick={() =>
                  setUser({
                    name: system?.username || 'Guest'
                  })}
              >
                <span className='s-icon'>history</span>
              </Button>
            }
          />
        </div>
      </Col>
    </Row>
    <div className='spirit-field'>
      <label>{t('theme')}</label>
      <ThemeSwitcher />
    </div>
  </>
}

Base.Title = <>
  <span className='s-icon'>settings</span>&nbsp;Base
</>
