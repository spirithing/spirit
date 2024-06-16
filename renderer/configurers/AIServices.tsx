import './AIServices.scss'

import { classnames } from '@shikitor/core/utils'
import type { CSSProperties } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AIService } from 'spirit'
import { Col, Input, Row } from 'tdesign-react'

import selfIcon from '../../resources/icon.svg'
import chatgptIcon from '../assets/chatgpt.svg'
import cozeIcon from '../assets/coze.svg'
import ollamaIcon from '../assets/ollama.svg'
import { ListWithPreview } from '../components/ListWithPreview'

export interface AIServicesProps {
  style?: CSSProperties
  className?: string
}

export function AIServices(props: AIServicesProps) {
  const { prefix } = AIServices
  const { t } = useTranslation()
  const { className, style } = props
  const [aiServices, setAIServices] = useState<AIService[]>([
    {
      uuid: '1',
      name: 'OpenAI',
      option: {
        type: 'openai',
        apiHost: 'https://api.openai.com',
        apiKey: 'openai-api',
        defaultModel: 'gpt-3.5-turbo'
      }
    },
    {
      uuid: '2',
      name: 'Self',
      description: 'Use the local AI service',
      avatar: selfIcon,
      option: {
        type: 'ollama',
        apiHost: 'https://api.openai.com',
        defaultModel: 'gpt-3.5-turbo'
      }
    }
  ])
  return <ListWithPreview
    style={style}
    className={classnames(prefix, className)}
    list={aiServices}
    types={{
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
    }}
    itemPreview:Writer={({ isEditing, value, onChange }) =>
      <>
        {value?.type === 'openai' && <>
          <Row gutter={12}>
            <Col span={6}>
              <div className='spirit-field'>
                <label>{t('apiBaseUrl')}</label>
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
        </>}
        {value?.type === 'ollama' && <>
          <Row gutter={12}>
            <Col span={6}>
              <div className='spirit-field'>
                <label>{t('apiBaseUrl')}</label>
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
        </>}
      </>}
    itemPreview:onCreate={item => {
      setAIServices([...aiServices, item])
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
