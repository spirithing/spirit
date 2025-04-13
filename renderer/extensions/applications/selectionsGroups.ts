import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { createUseSelectionsGroups } from '#renderer/.core/define.ts'
import type { SelectionsGroup } from '#renderer/atoms/sender.ts'
import { useElectronStore } from '#renderer/hooks/useStore.ts'

export const useSelectionsGroupsForApp = createUseSelectionsGroups(keyword => {
  const { t } = useTranslation()

  const [applications] = useElectronStore('applications')
  return useMemo<SelectionsGroup[]>(() => {
    if (keyword === '') return []

    const filtered = applications
      ?.filter(item => item.name.toLowerCase().includes(keyword))
      ?? []
    return [
      {
        title: 'result',
        selections: filtered
          .sort((a, b) => a.name.localeCompare(b.name))
          .sort((a, b) => {
            // 有图标的排前面
            if (a.icon && !b.icon) return -1
            if (!a.icon && b.icon) return 1
            return 0
          })
          .map(app => ({
            title: app.name,
            icon: app.icon
              ? { type: 'image', path: app.icon }
              : { type: 'icon', value: '🚀' },
            enterAction: ['open', app.path],
            operations: [
              { type: 'text', value: t('application.self') }
            ]
          }))
      }
    ]
  }, [t, applications, keyword])
})
