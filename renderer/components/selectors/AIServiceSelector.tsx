import './AIServiceSelector.scss'

import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Select } from 'tdesign-react'

import { useElectronStore } from '#renderer/hooks/useStore.ts'

export interface AIServiceSelectorProps {
  style?: CSSProperties
  value?: string
  defaultValue?: string
  onChange?(value: NonNullable<AIServiceSelectorProps['value']>): void
}

AIServiceSelector.prefix = `${'spirit'}-ai-service-selector`
export function AIServiceSelector({
  style,
  value,
  defaultValue,
  onChange
}: AIServiceSelectorProps) {
  const { prefix } = AIServiceSelector
  const { t } = useTranslation()
  const [aiServices] = useElectronStore('aiServices', [])

  return <Select
    filterable
    clearable
    style={style}
    className={prefix}
    popupProps={{
      overlayClassName: prefix
    }}
    placeholder={t('Please select an AI service')}
    value={value}
    defaultValue={defaultValue}
    onChange={v => onChange?.(v as string)}
    options={aiServices.map(aiService => ({
      label: aiService.name,
      title: aiService.description,
      content: <div className={`${prefix}__option`}>
        {aiService.avatar
          ? <img
            className={`${prefix}__option--icon`}
            src={aiService.avatar}
            alt={aiService.name}
            width={32}
            height={32}
          />
          : <div style={{ width: '32px' }} />}
        <div className={`${prefix}__option--title`}>
          {aiService.name}
          <div className={`${prefix}__option--description`}>
            {aiService.description}
          </div>
        </div>
      </div>,
      value: aiService.uuid
    }))}
  />
}
