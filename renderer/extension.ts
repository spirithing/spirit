import type { CSSProperties, ReactNode } from 'react'
import type {
  AIServiceAPIAdapter,
  AIServiceAPIOptionsForChat,
  AIServiceCreators,
  AIServiceOptions,
  AIServiceOptionsMap
} from 'spirit'

import type { ListItemWriterProps, ListType } from '#renderer/components/ListWithPreview.tsx'

type ChatConfigurerValue<
  T extends AIServiceAPIOptionsForChat['type'],
> = AIServiceAPIOptionsForChat & { type: T }

export interface ChatConfigurerProps<
  T extends AIServiceAPIOptionsForChat['type'],
> {
  style?: CSSProperties
  className?: string

  readonly?: boolean

  value?: ChatConfigurerValue<T>
  defaultValue?: ChatConfigurerValue<T>
  onChange?(value: NonNullable<ChatConfigurerProps<T>['value']>): void
}

export type AIServiceAdapter<
  K extends keyof AIServiceOptionsMap,
> = {
  creator: (options: AIServiceOptionsMap[K]) => K extends keyof AIServiceCreators ? AIServiceCreators[K] : never
  api: AIServiceAPIAdapter<K>
  type: ListType
  Writer: (props: ListItemWriterProps<AIServiceOptions & { type: K }>) => ReactNode
  ChatOptionsWriter?: (props: ChatConfigurerProps<K>) => ReactNode
}

export function defineAIServiceAdapter<K extends keyof AIServiceOptionsMap>(
  _: K,
  option: AIServiceAdapter<K>
) {
  return option
}
