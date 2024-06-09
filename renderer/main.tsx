import '@shikitor/react/index.css'
import 'tdesign-react/es/style/index.css'
import './store'
import './main.scss'
import './effect'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ErrorFallback } from './components/ErrorFallback'
import { I18NProvider } from './providers/i18n'
import { ThemeProvider } from './providers/theme'

createRoot(document.getElementById('root') as HTMLElement)
  .render(
    <StrictMode>
      <ErrorBoundary Fallback={ErrorFallback}>
        <I18NProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </I18NProvider>
      </ErrorBoundary>
    </StrictMode>
  )
