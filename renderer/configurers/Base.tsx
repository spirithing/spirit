import './Base.scss'

import { Fragment, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, Col, Collapse, Input, Link, Row, Select } from 'tdesign-react'

import favicon from '../../resources/icon.png'
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

function LayoutSwitcher() {
  const { t } = useTranslation()
  const prefix = 'spirit-layout-switcher'
  const [common, setCommon] = useElectronStore('common')
  const layout = common?.layout ?? 'auto'
  return <div className={prefix}>
    <Card
      size='small'
      hoverShadow
      className={classnames(layout === 'compact' ? `${prefix}--active` : '')}
      header={
        <>
          <span className='s-icon'>grid_view</span>
          {t('compact')}
        </>
      }
    >
      <div className={`${prefix}__window`}>
        <div className={`${prefix}__input`}>
          <div className={`${prefix}__input-text`} />
        </div>
        <div className={`${prefix}__footer`}>
          <div className={`${prefix}__footer-icon`} />
          <div className={`${prefix}__footer-message`} />
          <div className={`${prefix}__footer-actions`} />
        </div>
      </div>
    </Card>
    <Card
      size='small'
      hoverShadow
      className={classnames(layout === 'default' ? `${prefix}--active` : '', `${prefix}--active`)}
      header={
        <>
          <span className='s-icon'>grid_on</span>
          {t('default')}
        </>
      }
    >
      <div className={`${prefix}__window`}>
        <div className={`${prefix}__tabs`}>
          <div className={`${prefix}__tab`} />
        </div>
        <div className={`${prefix}__input`}>
          <div className={`${prefix}__input-text`} />
        </div>
        <div className={`${prefix}__footer`}>
          <div className={`${prefix}__footer-icon`} />
          <div className={`${prefix}__footer-message`} />
          <div className={`${prefix}__footer-actions`} />
        </div>
      </div>
    </Card>
    <Card
      size='small'
      hoverShadow
      className={classnames(layout === 'more' ? `${prefix}--active` : '')}
      header={
        <>
          <span className='s-icon'>view_compact</span>
          {t('more')}
        </>
      }
    >
      <div className={`${prefix}__window`}>
        <div className={`${prefix}__tabs`}>
          <div className={`${prefix}__tab`} />
        </div>
        <div className={`${prefix}__input`}>
          <div className={`${prefix}__input-text`} />
        </div>
        <div className={`${prefix}__selections`}>
          <div className={`${prefix}__selection`} />
        </div>
        <div className={`${prefix}__footer`}>
          <div className={`${prefix}__footer-icon`} />
          <div className={`${prefix}__footer-message`} />
          <div className={`${prefix}__footer-actions`} />
        </div>
      </div>
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
    let lang = common?.locale
    if (common?.locale === 'system') {
      // TODO
      // lang = system?.locale ?? navigator.language
      lang = navigator.language
    }
    if (lang === i18n.language) return
    i18n.changeLanguage(lang)
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
    <div className='spirit-field'>
      <label>{t('layout')}</label>
      <LayoutSwitcher />
    </div>
    <Collapse
      borderless
      className='spirit-info'
    >
      <Collapse.Panel
        header='About'
        headerRightContent={
          <>
            <Link
              size='small'
              href='spirit-oe://github.com/nwylzw/spirit'
              onClick={e => e.stopPropagation()}
            >
              <span className='s-icon'>star</span>
            </Link>
          </>
        }
      >
        <Card className='spirit-info__panel'>
          <div className='left'>
            <img src={favicon} alt='favicon' width={128} height={128} />
          </div>
          <div className='right'>
            <h2>{t('spirit')}@{import.meta.env.VITE_APP_VERSION}</h2>
            <br />
            <div>
              Built on {import.meta.env.VITE_BUILD_TIME
                ? new Date(Number(import.meta.env.VITE_BUILD_TIME)).toLocaleString()
                : 'unknown'}
            </div>
            <div>
              Powered by {[
                ['spirit-oe://github.com/electron/electron', 'Electron'],
                ['spirit-oe://github.com/facebook/react', 'React'],
                ['spirit-oe://github.com/tencent/tdesign-react', 'TDesign'],
                ['spirit-oe://github.com/i18next/react-i18next', 'react-i18next']
              ].map(([u, t], i, a) =>
                <Fragment key={u}>
                  <Link theme='primary' href={u}>{t}</Link>
                  {i < a.length - 1 && ', '}
                </Fragment>
              )}
            </div>
            <div>
              Copyright &copy; 2024-{new Date().getFullYear()}
            </div>
          </div>
        </Card>
      </Collapse.Panel>
    </Collapse>
  </>
}
