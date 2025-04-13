import { useMemo } from 'react'

import { createUseSelectionsGroups } from '#renderer/.core/define.ts'
import type { Selection, SelectionsGroup } from '#renderer/atoms/sender.ts'
import { useElectronStore } from '#renderer/hooks/useStore.ts'

export const useSelectionsForWechat = createUseSelectionsGroups(keyword => {
  const [wechats] = useElectronStore('wechats')
  return useMemo<SelectionsGroup[]>(() => {
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
    return [
      {
        title: 'result',
        selections: filtered.map(wechat =>
          ({
            icon: wechat.icon?.path
              ? { type: 'image', path: `atom://${wechat.icon.path}` }
              : { type: 'icon', value: 'person' },
            title: wechat.title ?? 'Unknown',
            placeholder: wechat.title !== wechat.subTitle ? wechat.subTitle : undefined,
            actions: {
              default: ['wechat', wechat.arg]
            },
            operations: [
              { type: 'text', value: 'WeChat' }
            ]
          }) as Selection
        )
      }
    ]
  }, [keyword, wechats])
})
