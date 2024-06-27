import MarkdownItPluginShiki from '@shikijs/markdown-it'
import MarkdownIt from 'markdown-it'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import { useHighlightTheme } from '../providers/theme'
import { Operators } from './useMDRender.operators'

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
              hast.children.unshift(
                // TODO
                // @ts-ignore
                Operators({ code: this.source })
              )
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
