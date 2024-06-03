import MarkdownItPluginShiki from '@shikijs/markdown-it'
import MarkdownIt from 'markdown-it'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import { useTheme, useThemeStore } from '../providers/theme'

const mdit = MarkdownIt()

export const useMDRender = () => {
  const [theme] = useTheme()
  const [themeStore] = useThemeStore()
  const [md, setMD] = useState<MarkdownIt>(mdit)
  const { data: mditPluginShiki } = useSWR(
    ['mditPluginShiki', theme, themeStore?.highlightTheme],
    () =>
      MarkdownItPluginShiki({
        themes: {
          light: themeStore?.highlightTheme ?? (
            theme === 'dark' ? 'github-dark' : 'github-light'
          )
        }
      })
  )
  useEffect(() => {
    if (!mditPluginShiki) return
    setMD(MarkdownIt().use(mditPluginShiki))
  }, [mditPluginShiki])
  return md
}
