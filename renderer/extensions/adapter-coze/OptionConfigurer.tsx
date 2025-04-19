import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { AIServiceOptions } from 'spirit'
import { Col, Input, Row } from 'tdesign-react'

import type { ListItemWriterProps } from '../../components/ListWithPreview'
import { getOrCreateInstanceAndAPI } from '../../configurers/AIService/base'
import { CozeProvider } from './Provider'
import { ModelSelector } from './selectors/ModelSelector'

export function OptionConfigurer(
  props: ListItemWriterProps<AIServiceOptions & { type: 'coze' }>
) {
  const { t } = useTranslation()
  const { isEditing, value, onChange, onOnConfirm } = props
  const [instance, api] = useMemo(() => getOrCreateInstanceAndAPI(value), [value])
  useEffect(() => {
    return onOnConfirm?.(value => {
      if (!value?.defaultBotID || value?.defaultBotID === '') {
        throw new Error(t('required', {
          name: t('defaultBotID')
        }))
      }
    })
  }, [onOnConfirm, t])
  return <CozeProvider value={{ instance, api }}>
    <Row gutter={12}>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('apiHost')}</label>
          <Input
            readonly={!isEditing}
            disabled={!isEditing}
            placeholder='https://api.coze.cn/open_api/v2'
            value={value.apiHost}
            onChange={v => onChange({ ...value, apiHost: v as string })}
          />
        </div>
        <div className='spirit-field'>
          <label>{t('defaultBotID')}</label>
          <ModelSelector
            readonly={!isEditing}
            disabled={!isEditing}
            value={value.defaultBotID}
            onChange={v => onChange({ ...value, defaultBotID: v as string })}
          />
        </div>
      </Col>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('bearerToken')}</label>
          <Input
            type='password'
            readonly={!isEditing}
            disabled={!isEditing}
            value={value.bearerToken}
            onChange={v => onChange({ ...value, bearerToken: v as string })}
          />
        </div>
      </Col>
    </Row>
  </CozeProvider>
}
