import { defaultsDeep } from 'lodash-es'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { AIServiceAPIOptionsForChat } from 'spirit'
import { Col, Collapse, Input, Row, Switch, Textarea } from 'tdesign-react'

import { AIServiceSelector } from '#renderer/components/selectors/AIServiceSelector.tsx'
import { aiServiceExtensionMap, InstanceAndAPIProvider } from '#renderer/configurers/AIService/base.tsx'
import type { ChatConfigurerProps } from '#renderer/extension.ts'
import { useChatroom } from '#renderer/hooks/useChatroom.ts'
import { useElectronStore } from '#renderer/hooks/useStore.ts'

export function Chatroom() {
  const { t } = useTranslation()

  const [chatroom, { setChatroom }] = useChatroom()

  const aiServiceUUID = useMemo(() => chatroom?.options?.aiService?.uuid, [chatroom])
  const [aiServices] = useElectronStore('aiServices', [])
  const aiService = useMemo(() => {
    if (!aiServiceUUID) return
    return aiServices.find(aiService => aiService.uuid === aiServiceUUID)
  }, [aiServiceUUID, aiServices])

  const aiServiceExtension = useMemo(() => {
    if (!aiService) return
    return aiServiceExtensionMap[aiService.options.type]
  }, [aiService])
  const ChatOptionsWriter = useCallback(
    <T extends AIServiceAPIOptionsForChat['type']>(props: ChatConfigurerProps<T>) => {
      if (!aiServiceExtension?.ChatOptionsWriter) return <></>

      // @ts-ignore
      return <aiServiceExtension.ChatOptionsWriter {...props} />
    },
    [aiServiceExtension]
  )
  return <>
    <Row gutter={12}>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('name')}</label>
          <Input
            value={chatroom?.name}
            onChange={v => setChatroom({ ...chatroom!, name: v })}
          />
        </div>
      </Col>
      <Col span={6}>
        <div className='spirit-field'>
          <label>{t('desc')}</label>
          <Textarea
            value={chatroom?.description}
            onChange={v => setChatroom({ ...chatroom!, description: v })}
            autosize={{ minRows: 1, maxRows: 6 }}
          />
        </div>
      </Col>
    </Row>
    <Row gutter={12}>
      <Col span={12}>
        <Collapse>
          <Collapse.Panel header={t('chatroomOptions')}>
            <div className='spirit-field'>
              <label>{t('aiServices')}</label>
              <AIServiceSelector
                value={aiServiceUUID}
                onChange={v =>
                  setChatroom({
                    ...chatroom!,
                    options: defaultsDeep({
                      aiService: {
                        uuid: v
                      }
                    }, chatroom.options)
                  })}
              />
            </div>
            {aiService && <InstanceAndAPIProvider options={aiService.options}>
              <ChatOptionsWriter
                value={chatroom?.options?.aiService?.options?.chat as any}
                onChange={v =>
                  setChatroom({
                    ...chatroom!,
                    options: defaultsDeep({
                      aiService: {
                        options: {
                          chat: v
                        }
                      }
                    }, chatroom.options)
                  })}
              />
            </InstanceAndAPIProvider>}
            <div className='spirit-field'>
              <label>工具</label>
              <div>
                <Switch
                  value={chatroom.options?.enableTools}
                  onChange={v =>
                    setChatroom({
                      ...chatroom!,
                      options: { ...chatroom.options, enableTools: v }
                    })}
                  label={['启用', '停用']}
                />
              </div>
            </div>
          </Collapse.Panel>
        </Collapse>
      </Col>
    </Row>
  </>
}
