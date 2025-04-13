import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import useSWR from 'swr'

import { createUseSelectionsGroups } from '#renderer/.core/define.ts'
import type { Selection, SelectionsGroup } from '#renderer/atoms/sender.ts'
import { bridge } from '#renderer/bridge.ts'
import { useAct } from '#renderer/effects/actions.ts'
import { electronStore, keyAtom } from '#renderer/store.ts'
import { hightlightKeywords } from '#renderer/utils/hightlightKeywords.tsx'

declare module 'spirit' {
  export interface Actions {
    openBrowser: [url: string]
  }
}

const googleSearchCompletionUrl = (lang: string, q: string) =>
  `https://suggestqueries.google.com/complete/search?output=toolbar&hl=${lang}&q=${encodeURIComponent(q)}`

export const useSelectionsGroupsForSearcherCompletions = createUseSelectionsGroups(keyword => {
  const { i18n } = useTranslation()
  const { data: completions = [] } = useSWR(
    keyword === '' ? null : googleSearchCompletionUrl(i18n.language, keyword),
    async url => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch')
      }
      const xml = await res.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(xml, 'text/xml')
      return Array.from(doc.querySelectorAll('suggestion'))
        .map(suggestion => suggestion.getAttribute('data'))
        .filter(Boolean)
        .map(suggestion => suggestion as string)
    }
  )

  useAct('openBrowser', async url => {
    await bridge.openBrowser(url)
    electronStore.set(keyAtom('display')!, false)
  })
  return useMemo<SelectionsGroup[]>(() => {
    if (keyword === '') return []

    return [
      {
        title: 'searcher.google',
        selections: completions
          .map(completion =>
            ({
              title: hightlightKeywords(completion, keyword),
              icon: { type: 'icon', value: 'search' },
              actions: {
                default: [
                  'openBrowser',
                  `https://www.google.com/search?q=${encodeURIComponent(completion)}`
                ]
              }
            }) as Selection
          )
      },
      {
        title: 'chrome.tools',
        order: -1,
        selections: (
          [
            {
              title: 'chrome inspect',
              icon: { type: 'icon', value: 'link' },
              actions: {
                default: ['openBrowser', 'chrome://inspect/#devices']
              }
            },
            {
              title: 'chrome settings',
              icon: { type: 'icon', value: 'link' },
              actions: {
                default: ['openBrowser', 'chrome://settings']
              }
            },
            {
              title: 'chrome history',
              icon: { type: 'icon', value: 'link' },
              actions: {
                default: ['openBrowser', 'chrome://history']
              }
            }
          ] satisfies Selection[]
        ).filter(s => s.title.toLowerCase().includes(keyword))
      }
    ]
  }, [completions, keyword])
})
