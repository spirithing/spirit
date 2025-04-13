import { evaluate } from 'mathjs'
import Nzh from 'nzh'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { createUseSelectionsGroups } from '#renderer/.core/define.ts'
import type { SelectionsGroup } from '#renderer/atoms/sender.ts'

export const useSelectionsGroupsForCalc = createUseSelectionsGroups(keyword => {
  const { t } = useTranslation()
  const [result, setResult] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (keyword === '') {
      setResult(undefined)
      return
    }

    try {
      setResult(String(evaluate(keyword)))
    } catch { /* empty */ }
  }, [keyword])
  return useMemo<SelectionsGroup[]>(() => {
    if (keyword === '' || result === undefined) return []

    const selections: SelectionsGroup['selections'] = [
      {
        title: result,
        icon: { type: 'icon', value: '🧮' }
      }
    ]
    const num = Number(result)
    if (Number.isInteger(num)) {
      selections.push(
        {
          title: '0b' + num.toString(2),
          placeholder: t('binary'),
          icon: { type: 'icon', value: '🧮' }
        },
        {
          title: '0x' + num.toString(16),
          placeholder: t('hexadecimal'),
          icon: { type: 'icon', value: '🧮' }
        },
        {
          title: Nzh.cn.encodeS(num),
          placeholder: t('chineseLower'),
          icon: { type: 'icon', value: '🧮' }
        },
        {
          title: Nzh.cn.encodeB(num),
          placeholder: t('chineseUpper'),
          icon: { type: 'icon', value: '🧮' }
        }
      )
    }
    return [
      {
        title: 'calculator',
        selections
      }
    ]
  }, [keyword, result, t])
})
