import { useMemo } from 'react'

import { defineSelectionsProviderHook } from '#renderer/.core/define.ts'
import type { Selection } from '#renderer/atoms/sender.ts'
import { useElectronStore } from '#renderer/hooks/useStore.ts'

export const useSelectionsOfApplications = defineSelectionsProviderHook(keyword => {
  const [applications] = useElectronStore('applications')
  return useMemo<Selection[]>(() => {
    if (keyword === '') return []

    const filtered = applications
      ?.filter(item => item.name.toLowerCase().includes(keyword))
      ?? []
    return filtered.map(app => ({
      icon: app.icon
        ? { type: 'image', path: app.icon }
        : { type: 'icon', value: '🚀' },
      title: app.name.replace(/\.app$/, ''),
      enterAction: ['open', app.path],
      operations: [
        { type: 'text', value: 'Application' }
      ]
    }))
  }, [applications, keyword])
})
