import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { AIServiceOptions } from 'spirit'
import { Col, Input, Row } from 'tdesign-react'

import type { ListItemWriterProps } from '#renderer/components/ListWithPreview.tsx'
import { InstanceAndAPIProvider } from '#renderer/configurers/AIService/base.tsx'

import { ModelSelector } from '../selectors/ModelSelector'

export function OptionConfigurer(
  props: ListItemWriterProps<AIServiceOptions & { type: 'ollama' }>
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
      if (!value?.defaultModel || value?.defaultModel === '') {
        throw new Error(t('required', {
          name: t('defaultModel')
        }))
      }
    })
  }, [onOnConfirm, t])
  return <InstanceAndAPIProvider options={value}>
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
          <label>{t('apiHost')}</label>
          <ModelSelector
            readonly={!isEditing}
            disabled={!isEditing}
            value={value.defaultModel}
            onChange={v => onChange({ ...value, defaultModel: v as string })}
          />
        </div>
      </Col>
    </Row>
  </InstanceAndAPIProvider>
}
