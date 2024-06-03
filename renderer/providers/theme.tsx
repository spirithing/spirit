import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { useElectronStore } from '../hooks/useStore'

type Theme = 'light' | 'dark' | (string & {})

const ThemeContext = createContext<Theme>('light')

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [common] = useElectronStore('common')
  const theme = common?.theme ?? 'auto'
  const [systemTheme, setSystemTheme] = useState<Theme>(() =>
    window
        .matchMedia('(prefers-color-scheme: dark)')
        .matches
      ? 'dark'
      : 'light'
  )
  useEffect(() => {
    const mediaQueryListDark = window.matchMedia('(prefers-color-scheme: dark)')
    const listenMediaQueryListDark = (mediaQueryListEvent: MediaQueryListEvent) => {
      setSystemTheme(mediaQueryListEvent.matches ? 'dark' : 'light')
    }
    mediaQueryListDark.addListener(listenMediaQueryListDark)
    return () => mediaQueryListDark.removeListener(listenMediaQueryListDark)
  }, [])
  const calcTheme = useMemo(() => {
    if (theme === 'auto') {
      return systemTheme
    }
    return theme
  }, [systemTheme, theme])
  useEffect(() => {
    if (calcTheme === 'dark') {
      document.documentElement.setAttribute('theme-mode', 'dark')
    } else {
      document.documentElement.removeAttribute('theme-mode')
    }
  }, [calcTheme])
  return (
    <ThemeContext.Provider value={calcTheme}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
export const useThemeStore = () =>
  useElectronStore('theme', {
    highlightTheme: 'github-dark'
  })
export const useHighlightTheme = () => {
  const theme = useTheme()
  const [themeStore] = useThemeStore()
  return useMemo(() => {
    if (theme === 'dark') {
      return themeStore.highlightThemeWhenDark ?? themeStore.highlightTheme ?? 'github-dark'
    }
    return themeStore.highlightTheme ?? 'github-light'
  }, [
    theme,
    themeStore.highlightTheme,
    themeStore.highlightThemeWhenDark
  ])
}
