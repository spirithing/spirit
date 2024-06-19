import './AIServices.scss'

import { classnames } from '@shikitor/core/utils'
import type { CSSProperties } from 'react'
import { useEffect } from 'react'

import { ListWithPreview } from '../components/ListWithPreview'
import { useElectronStore } from '../hooks/useStore'
import { types } from './AIService/base'
import { AIServiceOptionConfigurer } from './AIService/OptionConfigurer'

export interface AIServicesProps {
  style?: CSSProperties
  className?: string
}

export function AIServices(props: AIServicesProps) {
  const { prefix } = AIServices
  const { className, style } = props
  const [aiServices, setAIServices] = useElectronStore('aiServices', [])
  const [defaultAIServiceUUID, setDefaultAIServiceUUID] = useElectronStore('defaultAIServiceUUID')
  useEffect(() => {
    // TODO clear default ai service uuid when it's not in aiServices
  }, [])
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
