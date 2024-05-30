import '@shikitor/react/index.css'
import 'tdesign-react/es/style/index.css'
import './store.init'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import { I18NProvider } from './providers/i18n'

createRoot(document.getElementById('root') as HTMLElement)
  .render(
    <StrictMode>
      <I18NProvider>
        <App />
      </I18NProvider>
    </StrictMode>
  )
