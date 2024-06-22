import type { ReactNode } from 'react'
import type { AIServiceAPIAdapter, AIServiceCreators, AIServiceOption, AIServiceOptions } from 'spirit'

import type { ListItemWriterProps, ListType } from './components/ListWithPreview'

export type AIServiceAdapter<
  K extends keyof AIServiceOptions,
> = {
  creator: (options: AIServiceOptions[K]) => K extends keyof AIServiceCreators ? AIServiceCreators[K] : never
  api: AIServiceAPIAdapter<K>
  type: ListType
  Writer: (props: ListItemWriterProps<AIServiceOption & { type: K }>) => ReactNode
}

export function defineAIServiceAdapter<K extends keyof AIServiceOptions>(
  _: K,
  option: AIServiceAdapter<K>
) {
  return option
}
