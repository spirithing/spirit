import './AIServices.scss'

import { classnames } from '@shikitor/core/utils'
import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AIService, AIServiceOption, AIServiceOptions } from 'spirit'
import { Col, Input, Row } from 'tdesign-react'

import chatgptIcon from '../assets/chatgpt.svg'
import cozeIcon from '../assets/coze.svg'
import ollamaIcon from '../assets/ollama.svg'
import type { ListItemWriterProps, ListWithPreviewProps } from '../components/ListWithPreview'
import { ListWithPreview } from '../components/ListWithPreview'

const types: ListWithPreviewProps<AIService>['types'] = {
  openai: {
    label: 'OpenAI',
    image: chatgptIcon
  },
  ollama: {
    label: 'Ollama',
    image: ollamaIcon
  },
  coze: {
    label: 'Coze',
    image: cozeIcon
  }
}

function AIServiceOptionConfigurerForOpenAI(
  props: ListItemWriterProps<AIServiceOptions['openai']>
) {
  const { t } = useTranslation()
  const { isEditing, value, onChange, onOnConfirm } = props
  useEffect(() => {
    return onOnConfirm?.(value => {
      if (!value?.apiHost || value?.apiHost === '') {
        throw new Error(t('required', {
          name: t('apiHost')
        }))
      }
      if (!value?.apiKey || value?.apiKey === '') {
        throw new Error(t('required', {
          name: t('apiKey')
        }))
      }
      console.log('onConfirm', value)
    })
  }, [onOnConfirm, t])
  return <>
    <Row gutter={12}>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('apiHost')}</label>
          <Input
            readonly={!isEditing}
            disabled={!isEditing}
            placeholder='https://api.openai.com/v1'
            value={value.apiHost}
            onChange={v => onChange({ ...value, apiHost: v as string })}
          />
        </div>
      </Col>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('apiKey')}</label>
          <Input
            readonly={!isEditing}
            disabled={!isEditing}
            value={value.apiKey}
            onChange={v => onChange({ ...value, apiKey: v })}
            type='password'
            // @ts-ignore
            spellCheck={false}
          />
        </div>
      </Col>
    </Row>
  </>
}

function AIServiceOptionConfigurerForOllama(
  props: ListItemWriterProps<AIServiceOptions['ollama']>
) {
  const { t } = useTranslation()
  const { isEditing, value, onChange, onOnConfirm } = props
  useEffect(() => {
    return onOnConfirm?.(value => {
      if (!value?.apiHost || value?.apiHost === '') {
        throw new Error(t('required', {
          name: t('apiHost')
        }))
      }
      console.log('onConfirm', value)
    })
  }, [onOnConfirm, t])
  return <>
    <Row gutter={12}>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('apiHost')}</label>
          <Input
            readonly={!isEditing}
            disabled={!isEditing}
            placeholder='https://api.openai.com/v1'
            value={value.apiHost}
            onChange={v => onChange({ ...value, apiHost: v as string })}
          />
        </div>
      </Col>
    </Row>
  </>
}

const aiServiceOptionConfigurerMapping: {
  [K in keyof AIServiceOptions]: (
    props: ListItemWriterProps<AIServiceOptions[K]>
  ) => ReactNode
} = {
  openai: AIServiceOptionConfigurerForOpenAI,
  ollama: AIServiceOptionConfigurerForOllama
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
  const [aiServices, setAIServices] = useState<AIService[]>([])
  return <ListWithPreview
    style={style}
    className={classnames(prefix, className)}
    list={aiServices}
    types={types}
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
