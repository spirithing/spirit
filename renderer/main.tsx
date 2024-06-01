import '@shikitor/react/index.css'
import 'tdesign-react/es/style/index.css'
import './store'
import './main.scss'

import type { ErrorInfo } from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useTranslation } from 'react-i18next'

import { App } from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { I18NProvider } from './providers/i18n'
import { ThemeProvider } from './providers/theme'

Object
  .values(import.meta.glob('./effects/*.ts'))
  .forEach(effect => effect())

function ErrorFallback({ error, errorInfo }: { error: Error; errorInfo: ErrorInfo }) {
  const { t } = useTranslation()
  return <>
    <h1>{t('errorFallback.title')}</h1>
    <details style={{ whiteSpace: 'pre-wrap' }} open={import.meta.env.DEV}>
      <pre>{error?.toString()}{errorInfo?.componentStack}</pre>
    </details>
    {t('errorFallback.tooltip')}
    <ul>
      <li>
        <a href='spirit-oe://github.com/NWYLZW/spirit/issues/new'>
          GitHub
        </a>
      </li>
    </ul>
  </>
}

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
