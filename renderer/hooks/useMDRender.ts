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
    () => MarkdownItPluginShiki({ theme: highlightTheme })
  )
  useEffect(() => {
    if (!mditPluginShiki) return
    setMD(MarkdownIt().use(mditPluginShiki))
  }, [mditPluginShiki])
  return md
}
