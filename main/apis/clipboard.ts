import { clipboard } from 'electron'

import { ee } from '../lifecycle'
import { getStore, setStore } from '../store'
import type { ClipboardItem } from './clipboard.share'
import { defineAPI } from './core/defineAPI'

const clipboards = getStore('clipboards') ?? []

const currentClipboards: {
  text: string
  html: string
  rtf: string
  bookmark: {
    title: string
    url: string
  }
  image?: string
} = {
  text: clipboard.readText('clipboard'),
  html: clipboard.readHTML('clipboard'),
  rtf: clipboard.readRTF('clipboard'),
  bookmark: clipboard.readBookmark(),
  image: undefined
}

ee.on('appReady', () => {
  const image = clipboard.readImage('clipboard')
  currentClipboards.image = image.isEmpty()
    ? undefined
    : image.toPNG().toString('base64')
})
// TODO 使用原生方法监听剪切板和选择内容

export const appendClipboard = defineAPI('appendToClipboard', async (itemOrText) => {
  const item = typeof itemOrText === 'string'
    ? {
      type: 'text' as const,
      text: itemOrText
    }
    : itemOrText
  const uuid = Math.random().toString(36).slice(2)
  const ctime = Date.now()
  const itemBase = {
    uuid,
    from: 'spirit',
    ctime
  }
  setStore('clipboards', [
    ...clipboards,
    {
      ...itemBase,
      ...item
    }
  ])
})

export const delClipboards = defineAPI('delClipboards', async (uuids) => {
  setStore('clipboards', clipboards.filter(item => !uuids.includes(item.uuid)))
})

export const updClipboard = defineAPI('updClipboard', async (uuid) => {
  const item = clipboards.find(item => item.uuid === uuid)
  if (!item) return
  const ctime = Date.now()
  setStore('clipboards', [
    ...clipboards.filter(i => i.uuid !== uuid),
    {
      ...item,
      uptime: ctime
    }
  ])
})

export const getClipboards = defineAPI('getClipboards', async (query, options) => {
  const { text, type, range } = query
  const { page = 0, size = 10 } = options
  const start = range?.[0] ?? page * size
  const end = range?.[1] ?? start + size
  const filtered: ClipboardItem[] = clipboards.filter(item => {
    if (text) {
      switch (item.type) {
        case 'text':
          if (item.text.includes(text)) return true
          break
        case 'html':
          if (item.html.includes(text)) return true
          break
        case 'rtf':
          if (item.rtf.includes(text)) return true
          break
        case 'bookmark':
          if (item.bookmark.title.includes(text) || item.bookmark.url.includes(text)) return true
          break
        case 'image':
          return false
      }
    }
    // noinspection RedundantIfStatementJS
    if (type && item.type !== type) return false
    return true
  })
  return {
    count: filtered.length,
    value: filtered.slice(start, end) as any[]
  }
})
