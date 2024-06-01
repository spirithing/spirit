import '@shikitor/react/index.css'
import 'tdesign-react/es/style/index.css'
import './store'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import { I18NProvider } from './providers/i18n'
import { ThemeProvider } from './providers/theme'

Object
  .values(import.meta.glob('./effects/*.ts'))
  .forEach(effect => effect())

createRoot(document.getElementById('root') as HTMLElement)
  .render(
    <StrictMode>
      <I18NProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </I18NProvider>
    </StrictMode>
  )
