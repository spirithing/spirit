import { useMemo } from 'react'

import { defineSelectionsProviderHook } from '#renderer/.core/define.ts'
import type { Selection } from '#renderer/atoms/sender.ts'
import { useElectronStore } from '#renderer/hooks/useStore.ts'

export const useSelectionsOfWechat = defineSelectionsProviderHook(keyword => {
  const [wechats] = useElectronStore('wechats')
  return useMemo<Selection[]>(() => {
    if (keyword === '') return []

    let matchKeyword = keyword
    if (keyword.startsWith('wc ')) {
      matchKeyword = keyword.slice(3)
    }
    const filtered = wechats
      ?.filter(item => (
        item.title?.toLowerCase().includes(matchKeyword)
        || item.subTitle?.toLowerCase().includes(matchKeyword)
      ))
      ?? []
    return filtered.map(wechat => ({
      icon: wechat.icon?.path
        ? { type: 'image', path: `atom://${wechat.icon.path}` }
        : { type: 'icon', value: 'person' },
      title: wechat.title ?? 'Unknown',
      placeholder: wechat.title !== wechat.subTitle ? wechat.subTitle : undefined,
      enterAction: ['wechat', wechat.arg],
      operations: [
        { type: 'text', value: 'WeChat' }
      ]
    }))
  }, [keyword, wechats])
})
