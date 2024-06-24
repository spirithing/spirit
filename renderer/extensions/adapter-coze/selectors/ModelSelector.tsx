import type { CSSProperties } from 'react'
import useSWR from 'swr'
import { LoadingIcon } from 'tdesign-icons-react'
import { Select } from 'tdesign-react'

import { useCoze } from '../Provider'

export interface ModelSelectorProps {
  style?: CSSProperties
  readonly?: boolean
  disabled?: boolean
  value?: string
  defaultValue?: string
  onChange?(value: NonNullable<ModelSelectorProps['value']>): void
}

export function ModelSelector({
  style,
  readonly,
  disabled,
  value,
  defaultValue,
  onChange
}: ModelSelectorProps) {
  const { api, instance } = useCoze() ?? {}
  const { data: models, isLoading, isValidating } = useSWR(
    ['coze.models', api, instance],
    async () => instance ? await api?.models(instance) : undefined
  )
  return <Select
    filterable
    creatable
    readonly={readonly}
    disabled={disabled}
    style={style}
    value={value}
    defaultValue={defaultValue}
    onChange={v => onChange?.(v as NonNullable<ModelSelectorProps['value']>)}
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
  />
}
