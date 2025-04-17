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
import { electronStore, keyAtom } from './store'

const root = document.getElementById('root')!

document.body.addEventListener('click', e => {
  if (e.target !== document.body) return

  const displayAtom = keyAtom('display')
  if (!displayAtom) return

  electronStore.set(displayAtom, false)
})

createRoot(root)
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
