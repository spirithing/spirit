import OpenAI from 'openai'
import type { CSSProperties } from 'react'
import useSWR from 'swr'
import { LoadingIcon } from 'tdesign-icons-react'
import { Select } from 'tdesign-react'

import { useOpenAI } from '../Provider'

import ChatModel = OpenAI.ChatModel

export interface ModelSelectorProps {
  style?: CSSProperties
  value?: (string & {}) | ChatModel
  defaultValue?: (string & {}) | ChatModel
  onChange?(value: NonNullable<ModelSelectorProps['value']>): void
}

export function ModelSelector({
  style,
  value,
  defaultValue,
  onChange
}: ModelSelectorProps) {
  const { api, instance } = useOpenAI() ?? {}
  const { data: models, isLoading, isValidating } = useSWR(
    ['openai.chatroom', api, instance],
    async () => (instance && await api?.models(instance)) ?? []
  )
  return <Select
    filterable
    creatable
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
