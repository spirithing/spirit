import { describe, expect, expectTypeOf, test, vi } from 'vitest'

import type { CozeQuesterChatResp, CozeQuesterChatRespIterItem, CozeQuesterMessage } from '../Quester'
import CozeQuester from '../Quester'

const botID = process.env.COZE_BOT_ID as string

describe('Quester', () => {
  const q = new CozeQuester({
    apiHost: 'https://api.coze.cn/open_api/v2',
    bearerToken: process.env.COZE_PAT as string
  })
  describe('no stream', () => {
    test('base', async () => {
      const resp = await q.chat({
        botID,
        user: 'yiijie',
        query: '你好',
        stream: false
      })
      expectTypeOf(resp).toEqualTypeOf<CozeQuesterChatResp>()
      expect(resp.code).eq(0)
      expect(resp.msg).eq('success')
      expect(resp.messages).not.empty
    })
    test('throw error when no bot id', async () => {
      try {
        await q.chat({
          botID: '',
          user: 'yiijie',
          query: '你好',
          stream: false
        })
      } catch (e) {
        expect(e).instanceOf(Error)
        expect(e).property('message').eq('[702242001] 参数传递错误，请查阅对应 API 文档')
      }
    })
    test('with history', { timeout: 10000 }, async () => {
      const { messages: m0 } = await q.chat({
        botID,
        user: 'yiijie',
        query: '你好',
        stream: false,
        chatHistory: [
          {
            role: 'user',
            content: '你好',
            contentType: 'text'
          }
        ]
      })
      expect(m0).not.empty
      const { messages: m1 } = await q.chat({
        botID,
        user: 'yijie',
        query: '我刚刚说了什么',
        stream: false,
        chatHistory: [
          {
            role: 'user',
            content: '你好',
            contentType: 'text'
          },
          ...(m0 as CozeQuesterMessage[])
        ]
      })
      expect(m1).not.empty
    })
  })
  describe('stream', () => {
    test('base', async () => {
      const resp = await q.chat({
        botID,
        user: 'yiijie',
        query: '你好',
        stream: true
      })
      expectTypeOf(resp).toEqualTypeOf<AsyncGenerator<CozeQuesterChatRespIterItem>>()
      let count = 0
      const doneCalled = vi.fn()
      for await (const item of resp) {
        expectTypeOf(item).toEqualTypeOf<CozeQuesterChatRespIterItem>()
        if (item.event === 'done') {
          doneCalled()
          return
        }
        if (item.event === 'error') {
          throw new Error(item.errorInformation.msg)
        }
        const { seqID } = item
        expect(seqID).eq(count)
        count++
      }
      expect(count).gt(0)
      expect(doneCalled).toBeCalled()
    })
    test('throw error when no bot id', async () => {
      const resp = await q.chat({
        botID: '',
        user: 'yiijie',
        query: '你好',
        stream: true
      })
      for await (const item of resp) {
        expectTypeOf(item).toEqualTypeOf<CozeQuesterChatRespIterItem>()
        if (item.event === 'error') {
          expect(item.errorInformation.code).eq(702242001)
          expect(item.errorInformation.msg).eq('参数传递错误，请查阅对应 API 文档')
          return
        } else {
          throw new Error('should throw error')
        }
      }
    })
  })
})
