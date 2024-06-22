import OpenAI from 'openai'
import type { CSSProperties } from 'react'
import useSWR from 'swr'
import { LoadingIcon } from 'tdesign-icons-react'
import { Select } from 'tdesign-react'

import { useOllama } from '../Provider'

import ChatModel = OpenAI.ChatModel

export interface ModelSelectorProps {
  style?: CSSProperties
  readonly?: boolean
  disabled?: boolean
  value?: (string & {}) | ChatModel
  defaultValue?: (string & {}) | ChatModel
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
  const { api, instance } = useOllama() ?? {}
  const { data: models, isLoading, isValidating } = useSWR(
    ['ollama.models', api, instance],
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
