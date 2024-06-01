import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useElectronStore } from '../hooks/useStore'

export const useBot = () => {
  const { t } = useTranslation()
  return useElectronStore(
    'bot',
    useMemo(() => ({
      name: t('spirit'),
      description:
        '一个 AI 助手，中文环境下的分类为器灵，英文环境下的分类为 Spirit。通过快捷入口触发，帮助用户解决问题，也可以陪用户聊天。\n'
        + '器灵的中文意义是「器物的灵魂」，万物皆有灵，那么电脑的灵便是 AI 了。'
    }), [t])
  )
}
