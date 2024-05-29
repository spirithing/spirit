import '@shikitor/react/index.css'
import 'tdesign-react/es/style/index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'

createRoot(document.getElementById('root') as HTMLElement)
  .render(
    <StrictMode>
      <App />
    </StrictMode>
  )
