import i18n from 'i18next'
import { merge } from 'lodash-es'
import { type ReactNode, useMemo } from 'react'
import { initReactI18next, useTranslation } from 'react-i18next'
import { ConfigProvider } from 'tdesign-react'
import arKW from 'tdesign-react/es/locale/ar_KW'
import enUS from 'tdesign-react/es/locale/en_US'
import itIT from 'tdesign-react/es/locale/it_IT'
import jaJP from 'tdesign-react/es/locale/ja_JP'
import koKR from 'tdesign-react/es/locale/ko_KR'
import ruRU from 'tdesign-react/es/locale/ru_RU'
import zhCN from 'tdesign-react/es/locale/zh_CN'
import zhTW from 'tdesign-react/es/locale/zh_TW'

import enUSInner from '../../locales/en_US.json'
import zhCNInner from '../../locales/zh_CN.json'

const DEFAULT_LANGUAGE = navigator.language

const tdI18n: Record<string, unknown> = {
  'ar-KW': arKW,
  'en-US': enUS,
  'it-IT': itIT,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'ru-RU': ruRU,
  'zh-CN': zhCN,
  'zh-TW': zhTW
}

export const bundledLanguages = Object.keys(tdI18n)

const resources = {
  'en-US': {
    application: enUSInner
  },
  'zh-CN': {
    application: zhCNInner
  }
} as const
const defaultNS = 'application'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: typeof resources[keyof typeof resources]
  }
}

i18n
  .use(initReactI18next)
  .init({
    debug: import.meta.env.MODE !== 'production',
    lng: DEFAULT_LANGUAGE,
    defaultNS,
    resources
  })

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
