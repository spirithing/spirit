import { defaultsDeep } from 'lodash-es'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { AIServiceOptions } from 'spirit'
import { Col, Collapse, Input, Row } from 'tdesign-react'

import type { ListItemWriterProps } from '#renderer/components/ListWithPreview.tsx'
import { getOrCreateInstanceAndAPI } from '#renderer/configurers/AIService/base.ts'

import { ChatConfigurer } from './configurers/ChatConfigurer'
import { OpenAIProvider } from './Provider'
import { ModelSelector } from './selectors/ModelSelector'

export function OptionsConfigurer(
  props: ListItemWriterProps<AIServiceOptions & { type: 'openai' }>
) {
  const { t } = useTranslation()
  const { isEditing, value, onChange, onOnConfirm } = props
  const [instance, api] = useMemo(() => getOrCreateInstanceAndAPI(value), [value])
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
    })
  }, [onOnConfirm, t])
  return <OpenAIProvider value={{ instance, api }}>
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
        <div className='spirit-field'>
          <label>{t('openaiConfig.defaultModel')}</label>
          <ModelSelector
            readonly={!isEditing}
            disabled={!isEditing}
            value={value.defaultModel}
            onChange={v => onChange({ ...value, defaultModel: v as string })}
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
    <Collapse>
      <Collapse.Panel header={t('aiService.chatroomOptions')}>
        <ChatConfigurer
          readonly={!isEditing}
          value={defaultsDeep(value.chat, {
            model: value.defaultModel
          })}
          onChange={v => onChange({ ...value, chat: v })}
        />
      </Collapse.Panel>
    </Collapse>
  </OpenAIProvider>
}
