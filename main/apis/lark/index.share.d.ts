import type { Client } from '@larksuiteoapi/node-sdk'

type SearchChat = Client['im']['v1']['chat']['search']

declare module 'spirit' {
  interface BridgeMethods {
    searchInLark: {
      (type: 'chat', payload: Parameters<SearchChat>[0]): ReturnType<SearchChat>
    }
  }
  interface BridgeSyncMethods {
    setLarkAppInfo: (info: {
      appId: string
      appSecret: string
      appType?: 'selfBuild' | 'ISV'
      domain?: 'feishu' | 'lark' | (string & {})
    }) => void
    setLarkUserAccessToken: (token: string) => void
  }
  interface Store {
  }
}

export {}
