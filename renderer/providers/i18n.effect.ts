import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
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

export const DEFAULT_LANGUAGE = navigator.language

export const tdI18n: Record<string, unknown> = {
  'ar-KW': arKW,
  'en-US': enUS,
  'it-IT': itIT,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'ru-RU': ruRU,
  'zh-CN': zhCN,
  'zh-TW': zhTW
}

export const bundledLocales = Object.keys(tdI18n)

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
    lng: DEFAULT_LANGUAGE,
    defaultNS,
    resources
  })

// if (import.meta.hot) {
//   // const resourceReload = (lng: string) => ([moduleId]: (string | number)[]) => {
//   //   console.log(`update ${lng}.json`)
//   //   i18n.addResourceBundle(lng, 'application', import(moduleId), true, true)
//   //   if (i18n.language === lng) i18n.changeLanguage(lng)
//   // }
//   import.meta.hot.accept(['/@fs/__WORKSPACE_DIR__/locales/*.json'], console.log)
// }
