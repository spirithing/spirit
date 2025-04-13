import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { createUseSelectionsGroups } from '#renderer/.core/define.ts'
import type { Selection, SelectionsGroup } from '#renderer/atoms/sender.ts'
import { useElectronStore } from '#renderer/hooks/useStore.ts'
import { hightlightKeywords } from '#renderer/utils/hightlightKeywords.tsx'

export const useSelectionsGroupsForApp = createUseSelectionsGroups(keyword => {
  const { t } = useTranslation()

  const [applications] = useElectronStore('applications')
  return useMemo<SelectionsGroup[]>(() => {
    if (!applications || keyword === '') return []

    const filtered = applications
      .filter(item => {
        const { name, info } = item
        return name.toLowerCase().includes(keyword.toLowerCase())
          || info?.toLowerCase().includes(keyword.toLowerCase())
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => {
        // 有图标的排前面
        if (a.icon && !b.icon) return -1
        if (!a.icon && b.icon) return 1
        return 0
      })
      .map(app =>
        ({
          title: <>
            {hightlightKeywords(app.name, keyword)}
          </>,
          placeholder: <>
            {hightlightKeywords(app.info ?? '', keyword)}
          </>,
          icon: app.icon
            ? { type: 'image', path: app.icon }
            : { type: 'icon', value: '🚀' },
          enterAction: ['open', app.path],
          operations: [
            { type: 'text', value: t('application.self') }
          ]
        }) as Selection
      )
    return [
      {
        title: 'result',
        selections: filtered ?? []
      }
    ]
  }, [t, applications, keyword])
})
