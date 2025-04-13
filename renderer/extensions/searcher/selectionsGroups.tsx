import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import useSWR from 'swr'

import { createUseSelectionsGroups } from '#renderer/.core/define.ts'
import type { Selection, SelectionsGroup } from '#renderer/atoms/sender.ts'

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

  return useMemo<SelectionsGroup[]>(() => {
    if (keyword === '') return []

    const filtered = completions
      .map(completion =>
        ({
          title: completion,
          icon: { type: 'icon', value: 'search' }
        }) as Selection
      )
    return [
      {
        title: 'searcher.google',
        selections: filtered ?? []
      }
    ]
  }, [completions, keyword])
})
