import './AIServices.scss'

import { classnames } from '@shikitor/core/utils'
import type { CSSProperties, ReactNode } from 'react'
import { useMemo } from 'react'
import type { AIService, AIServiceOption, AIServiceOptions } from 'spirit'

import cozeIcon from '../assets/coze.svg'
import type { ListItemWriterProps, ListWithPreviewProps } from '../components/ListWithPreview'
import { ListWithPreview } from '../components/ListWithPreview'
import AdapterOllama from '../extensions/adapter-ollama'
import AdapterOpenAI from '../extensions/adapter-openai'
import { useElectronStore } from '../hooks/useStore'

const types: ListWithPreviewProps<AIService>['types'] = {
  openai: AdapterOpenAI.type,
  ollama: AdapterOllama.type,
  coze: {
    label: 'Coze',
    image: cozeIcon
  }
}

const aiServiceOptionConfigurerMapping: {
  [K in keyof AIServiceOptions]: (
    props: ListItemWriterProps<AIServiceOptions[K]>
  ) => ReactNode
} = {
  openai: AdapterOpenAI.Writer,
  ollama: AdapterOllama.Writer
}

function AIServiceOptionConfigurer(
  props: ListItemWriterProps<AIServiceOption>
) {
  const Comp = useMemo(() => {
    return aiServiceOptionConfigurerMapping[props.value.type]
  }, [props.value.type])
  // @ts-ignore
  return <Comp {...props} />
}

export interface AIServicesProps {
  style?: CSSProperties
  className?: string
}

export function AIServices(props: AIServicesProps) {
  const { prefix } = AIServices
  const { className, style } = props
  const [aiServices, setAIServices] = useElectronStore('aiServices', [])
  const [defaultAIServiceUUID, setDefaultAIServiceUUID] = useElectronStore('defaultAIServiceUUID')
  return <ListWithPreview
    style={style}
    className={classnames(prefix, className)}
    list={aiServices}
    types={types}
    taggedItemUUID={defaultAIServiceUUID}
    onTaggedItemUUIDChange={setDefaultAIServiceUUID}
    itemPreview:Writer={AIServiceOptionConfigurer}
    itemPreview:onCreate={item => {
      setAIServices([item, ...aiServices])
    }}
    itemPreview:onDelete={uuid => {
      setAIServices(aiServices.filter(item => item.uuid !== uuid))
    }}
    itemPreview:onUpdate={item => {
      setAIServices(aiServices.map(aiService => aiService.uuid === item.uuid ? item : aiService))
    }}
  />
}

AIServices.prefix = `${'spirit'}-ai-services`
