import './ModelSelector.scss'

import type { CSSProperties } from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import useSWR from 'swr'
import { LoadingIcon } from 'tdesign-icons-react'
import { Select } from 'tdesign-react'

import { getOrCreateInstanceAndAPI } from '../../configurers/AIService/base'
import { useElectronStore } from '../../hooks/useStore'

interface Value {
  aiServiceUUID?: string
  model?: string
}

export interface ModelSelectorProps {
  style?: CSSProperties
  value?: Value
  defaultValue?: Value
  onChange?(value: NonNullable<ModelSelectorProps['value']>): void
}

export function ModelSelector({
  style,
  value,
  defaultValue,
  onChange
}: ModelSelectorProps) {
  const { prefix } = ModelSelector
  const { t } = useTranslation()
  const [aiServices] = useElectronStore('aiServices', [])
  const aiService = useMemo(() => {
    let mapped = aiServices.find(
      aiService => aiService.uuid === value?.aiServiceUUID
    )
    if (!mapped) {
      mapped = aiServices.find(
        aiService => aiService.uuid === defaultValue?.aiServiceUUID
      )
    }
    return mapped
  }, [aiServices, defaultValue?.aiServiceUUID, value?.aiServiceUUID])
  const [instance, api] = useMemo(
    () => aiService?.option ? getOrCreateInstanceAndAPI(aiService.option) : [],
    [
      aiService?.option
    ]
  )
  const { data: models, isLoading, isValidating } = useSWR(
    [`${aiService?.option.type}.models`, instance, api],
    () => instance && api?.models(instance)
  )
  return <div className={prefix}>
    <Select
      filterable
      creatable
      clearable
      style={style}
      placeholder={t('Please select an AI service')}
      value={value?.aiServiceUUID}
      defaultValue={defaultValue?.aiServiceUUID}
      onChange={v =>
        onChange?.({
          aiServiceUUID: v as string,
          model: undefined
        })}
      options={aiServices.map(aiService => ({
        group: 'AI Service',
        label: aiService.name,
        title: aiService.description,
        value: aiService.uuid
      }))}
    />
    {(
      value?.aiServiceUUID
      || defaultValue?.aiServiceUUID
    ) && <Select
      filterable
      creatable
      clearable
      style={style}
      placeholder={t('Please select a model')}
      value={value?.model}
      defaultValue={defaultValue?.model}
      onChange={v =>
        onChange?.({
          ...value,
          model: v as string
        })}
      suffixIcon={isLoading || isValidating ? <LoadingIcon /> : undefined}
      options={models
        ?.sort((a, b) => (b?.created ?? 0) - (a?.created ?? 0))
        .map(model => ({
          label: model.label,
          title: model.label,
          value: model.id
        }))}
      inputProps={{
        onClick: ({ e }) => e.stopPropagation()
      }}
    />}
  </div>
}

ModelSelector.prefix = `${'spirit'}-model-selector`
