import type { ReactNode } from 'react'
import type { AIService, AIServiceOptions } from 'spirit'

import type { ListItemWriterProps, ListWithPreviewProps } from '../../components/ListWithPreview'
import AdapterOllama from '../../extensions/adapter-ollama'
import AdapterOpenAI from '../../extensions/adapter-openai'

export const types: ListWithPreviewProps<AIService>['types'] = {
  openai: AdapterOpenAI.type,
  ollama: AdapterOllama.type
}

export const aiServiceOptionConfigurerMapping: {
  [K in keyof AIServiceOptions]: (
    props: ListItemWriterProps<AIServiceOptions[K]>
  ) => ReactNode
} = {
  openai: AdapterOpenAI.Writer,
  ollama: AdapterOllama.Writer
}
