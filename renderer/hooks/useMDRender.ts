import MarkdownItPluginShiki from '@shikijs/markdown-it'
import MarkdownIt from 'markdown-it'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import { useHighlightTheme } from '../providers/theme'

const mdit = MarkdownIt()

export const useMDRender = () => {
  const highlightTheme = useHighlightTheme()
  const [md, setMD] = useState<MarkdownIt>(mdit)
  const { data: mditPluginShiki } = useSWR(
    ['mditPluginShiki', highlightTheme],
    () =>
      MarkdownItPluginShiki({
        theme: highlightTheme,
        transformers: [
          {
            name: 'operators',
            pre(hast) {
              hast.children.unshift({
                type: 'element',
                tagName: 'div',
                properties: { class: 's-md-code-operators' },
                children: [
                  {
                    type: 'element',
                    tagName: 'div',
                    properties: {
                      class: 's-icon copy',
                      title: 'Copy code',
                      'data-code': this.source
                    },
                    children: [
                      { type: 'text', value: 'content_copy' }
                    ]
                  }
                ]
              })
            }
          }
        ]
      })
  )
  useEffect(() => {
    if (!mditPluginShiki) return
    setMD(MarkdownIt().use(mditPluginShiki))
  }, [mditPluginShiki])
  return md
}
