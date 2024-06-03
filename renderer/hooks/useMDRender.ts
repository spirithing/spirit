import MarkdownItPluginShiki from '@shikijs/markdown-it'
import MarkdownIt from 'markdown-it'
import { useEffect, useRef } from 'react'

import { useTheme, useThemeStore } from '../providers/theme'

const mdit = MarkdownIt()
MarkdownItPluginShiki({
  themes: {
    light: 'github-light'
  }
}).then(plugin => mdit.use(plugin))

export const useMDRender = () => {
  const [theme] = useTheme()
  const [themeStore] = useThemeStore()
  const mdRef = useRef<MarkdownIt>()
  if (!mdRef.current) {
    mdRef.current = mdit
  }
  useEffect(() => {
    const mdit = MarkdownIt()
    MarkdownItPluginShiki({
      themes: {
        light: themeStore?.highlightTheme ?? (
          theme === 'dark' ? 'github-dark' : 'github-light'
        )
      }
    }).then(plugin => mdit.use(plugin))
    mdRef.current = mdit
  })
  return mdRef
}
