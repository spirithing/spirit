import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { AIServiceOption } from 'spirit'
import { Col, Input, Row } from 'tdesign-react'

import type { ListItemWriterProps } from '../../components/ListWithPreview'

export function OptionConfigurer(
  props: ListItemWriterProps<AIServiceOption & { type: 'ollama' }>
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
