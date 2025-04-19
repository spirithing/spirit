import type { ReactNode } from 'react'
import type { AIServiceAPIAdapter, AIServiceCreators, AIServiceOptions, AIServiceOptionsMap } from 'spirit'

import type { ListItemWriterProps, ListType } from './components/ListWithPreview'

export type AIServiceAdapter<
  K extends keyof AIServiceOptionsMap,
> = {
  creator: (options: AIServiceOptionsMap[K]) => K extends keyof AIServiceCreators ? AIServiceCreators[K] : never
  api: AIServiceAPIAdapter<K>
  type: ListType
  Writer: (props: ListItemWriterProps<AIServiceOptions & { type: K }>) => ReactNode
}

export function defineAIServiceAdapter<K extends keyof AIServiceOptionsMap>(
  _: K,
  option: AIServiceAdapter<K>
) {
  return option
}
