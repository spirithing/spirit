declare module 'spirit' {
  import type { BundledTheme } from 'shiki'

  export interface Theme {
    highlightTheme?: BundledTheme
    highlightThemeWhenDark?: BundledTheme
    colors?: {
      primary?: string | string[]
    }
  }
  export interface Store {
    theme: Theme
  }
}
