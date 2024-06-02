import OpenAI from 'openai'
import useSWR from 'swr'
import { LoadingIcon } from 'tdesign-icons-react'
import { Select } from 'tdesign-react'

import { useOpenAI } from '../../hooks/useOpenAI'
import ChatModel = OpenAI.ChatModel

export interface ModelSelectorProps {
  value?: (string & {}) | ChatModel
  onChange?(value: NonNullable<ModelSelectorProps['value']>): void
}

export function ModelSelector({
  value,
  onChange
}: ModelSelectorProps) {
  const openAI = useOpenAI()
  const { data: { data: models = [] } = {}, isLoading, isValidating } = useSWR('chatroom', () => openAI?.models.list())
  return <Select
    filterable
    creatable
    value={value}
    defaultValue={value}
    onChange={v => onChange?.(v as NonNullable<ModelSelectorProps['value']>)}
    suffixIcon={isLoading || isValidating ? <LoadingIcon /> : undefined}
    options={models
      .sort((a, b) => b.created - a.created)
      .map(model => ({
        group: 'OpenAI',
        label: model.id,
        title: `${model.id} (${new Date(model.created * 1000).toLocaleString()})`,
        value: model.id
      }))}
  />
}
