import { defaultsDeep } from 'lodash-es'
import { useTranslation } from 'react-i18next'

import type { ChatConfigurerProps } from '#renderer/extension.ts'

import { ModelSelector } from '../selectors/ModelSelector.tsx'

ChatConfigurer.prefix = `${'spirit'}-chat-configurer`
export function ChatConfigurer(props: ChatConfigurerProps<'openai'>) {
  const { t } = useTranslation()
  const { readonly, value, defaultValue, onChange } = props
  return <>
    <div className='spirit-field'>
      <label>{t('model')}</label>
      <ModelSelector
        readonly={readonly}
        disabled={readonly}
        value={value?.model}
        defaultValue={defaultValue?.model}
        onChange={v =>
          onChange?.(defaultsDeep({
            model: v as string
          }, value ?? {}))}
      />
    </div>
  </>
}
