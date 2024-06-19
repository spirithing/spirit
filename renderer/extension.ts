import type { ReactNode } from 'react'
import type { AIServiceAPIAdapter, AIServiceCreators, AIServiceOptions } from 'spirit'

import type { ListItemWriterProps, ListType } from './components/ListWithPreview'

export type AIServiceAdapter<
  K extends keyof AIServiceOptions,
> = {
  creator: (options: AIServiceOptions[K]) => K extends keyof AIServiceCreators ? AIServiceCreators[K] : never
  api: AIServiceAPIAdapter<'openai'>
  type: ListType
  Writer: (props: ListItemWriterProps<AIServiceOptions[K]>) => ReactNode
}

export function defineAIServiceAdapter<K extends keyof AIServiceOptions>(
  _: K,
  option: AIServiceAdapter<K>
) {
  return option
}
