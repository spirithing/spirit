import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { createUseSelectionsGroups } from '#renderer/.core/define.ts'
import type { Selection, SelectionsGroup } from '#renderer/atoms/sender.ts'
import { useElectronStore } from '#renderer/hooks/useStore.ts'

export const useSelectionsGroupsForApp = createUseSelectionsGroups(keyword => {
  const { t } = useTranslation()

  const [applications] = useElectronStore('applications')
  return useMemo<SelectionsGroup[]>(() => {
    if (!applications || keyword === '') return []

    const highlight = (text: string, keyword: string) => {
      const reg = new RegExp(`(${keyword})`, 'i')
      return text.split(reg).map((part, index) => (
        <span
          key={index}
          style={{
            color: part.toLowerCase() === keyword ? 'var(--td-brand-color)' : undefined,
            fontWeight: part.toLowerCase() === keyword ? 'bold' : 'normal'
          }}
        >
          {part}
        </span>
      ))
    }

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
            {highlight(app.name, keyword)}
          </>,
          placeholder: <>
            {highlight(app.info ?? '', keyword)}
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
