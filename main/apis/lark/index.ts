import { AppType, Client, Domain, withUserAccessToken } from '@larksuiteoapi/node-sdk'

import { defineAPI } from '../core/defineAPI'

let client: Client

let userAccessToken = withUserAccessToken(
  import.meta.env.VITE_MAIN_LARK_USER_ACCESS_TOKEN
)

export const setLarkUserAccessToken = defineAPI('setLarkUserAccessToken', token => {
  userAccessToken = withUserAccessToken(token)
})

export const setLarkAppInfo = defineAPI('setLarkAppInfo', info => {
  client = new Client({
    domain: {
      feishu: Domain.Feishu,
      lark: Domain.Lark,
      undefined: undefined
    }[info.domain ?? 'undefined'],
    appId: info.appId ?? import.meta.env.VITE_MAIN_LARK_APP_ID,
    appSecret: info.appSecret ?? import.meta.env.VITE_MAIN_LARK_APP_SECRET,
    appType: {
      selfBuild: AppType.SelfBuild,
      ISV: AppType.ISV,
      undefined: undefined
    }[info.appType ?? 'undefined']
  })
})

export const searchInLark = defineAPI('searchInLark', async (type, payload) => {
  if (!client) {
    throw new Error('Lark client not initialized')
  }
  switch (type) {
    case 'chat':
      return client.im.v1.chat.search(payload, userAccessToken)
  }
  throw new Error(`Unsupported type: ${type}`)
})
