import { useMemo } from 'react'

import { createUseSelectionsGroups } from '#renderer/.core/define.ts'
import type { SelectionsGroup } from '#renderer/atoms/sender.ts'
import { useElectronStore } from '#renderer/hooks/useStore.ts'

export const useSelectionsGroupsForApp = createUseSelectionsGroups(keyword => {
  const [applications] = useElectronStore('applications')
  return useMemo<SelectionsGroup[]>(() => {
    if (keyword === '') return []

    const filtered = applications
      ?.filter(item => item.name.toLowerCase().includes(keyword))
      ?? []
    return [
      {
        title: 'result',
        selections: filtered.map(app => ({
          icon: app.icon
            ? { type: 'image', path: app.icon }
            : { type: 'icon', value: '🚀' },
          title: app.name.replace(/\.app$/, ''),
          enterAction: ['open', app.path],
          operations: [
            { type: 'text', value: 'Application' }
          ]
        }))
      }
    ]
  }, [applications, keyword])
})
