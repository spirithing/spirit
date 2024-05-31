import MarkdownItPluginShiki from '@shikijs/markdown-it'
import MarkdownIt from 'markdown-it'
import { useRef } from 'react'

const mdit = MarkdownIt()
MarkdownItPluginShiki({
  themes: {
    light: 'github-light'
  }
}).then(plugin => mdit.use(plugin))

export const useMDRender = () => {
  const mdRef = useRef<MarkdownIt>()
  if (!mdRef.current) {
    mdRef.current = mdit
  }
  return mdRef
}
