import './Base.scss'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Input, Select } from 'tdesign-react'

import { bundledLocales } from '../providers/i18n'
import { useElectronStore } from '../store'
import { classnames } from '../utils/classnames'

function ThemeSwitcher() {
  const { t } = useTranslation()
  const prefix = 'spirit-theme-switcher'
  const [common, setCommon] = useElectronStore('common', {
    theme: 'auto',
    locale: 'system'
  })
  const theme = common!.theme ?? 'auto'
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
  const [user, setUser] = useElectronStore('user')
  useEffect(() => {
    if (!user) {
      setUser({ name: system?.username || 'Guest' })
    }
  }, [user, setUser, system?.username])
  return <>
    <div className='spirit-field'>
      <label>{t('locale')}</label>
      <Select
        options={[
          { label: 'System', value: 'system' },
          ...bundledLocales.map(locale => ({ label: locale, value: locale }))
        ]}
        value={common!.locale}
        onChange={v => setCommon({ locale: v as string })}
      />
    </div>
    <div className='spirit-field'>
      <label>{t('theme')}</label>
      <ThemeSwitcher />
    </div>
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
  </>
}
Base.Title = <>
  <span className='s-icon'>settings</span>&nbsp;Base
</>
