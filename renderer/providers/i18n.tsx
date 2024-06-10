import { merge } from 'lodash-es'
import { type ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfigProvider } from 'tdesign-react'

import { DEFAULT_LANGUAGE, tdI18n } from './i18n.effect'

export { bundledLocales } from './i18n.effect'

export function I18NProvider(props: { children: ReactNode }) {
  const { ready, i18n } = useTranslation()
  const config = useMemo(() =>
    merge(
      tdI18n[i18n.language] ?? tdI18n[DEFAULT_LANGUAGE],
      {
        calendar: {}
      }
    ), [i18n.language])
  if (!ready) return null
  return <ConfigProvider globalConfig={config}>
    {props.children}
  </ConfigProvider>
}
