import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Select } from 'tdesign-react'

import { bundledLocales } from '../providers/i18n'
import { useElectronStore } from '../store'

export function Base() {
  const [system] = useElectronStore('system')
  const [common, setCommon] = useElectronStore('common', {
    locale: 'system'
  })
  const { i18n } = useTranslation()
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
      <label>Locale</label>
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
      <label>Name</label>
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
