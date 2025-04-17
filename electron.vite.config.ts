import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

import pkg from './package.json'

process.env.VITE_APP_VERSION = pkg.version
process.env.VITE_BUILD_TIME = String(Date.now())

const port = process.env.PORT ?? 5173
// @ts-ignore
process.env.ELECTRON_RENDERER_URL = `http://localhost:${port}`

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: 'main/index.ts'
      }
    },
    envPrefix: [
      'VITE_',
      'VITE_MAIN_',
      'ELECTRON_'
    ],
    envDir: '.env/main',
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      lib: {
        entry: 'preload/index.ts'
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: 'renderer',
    esbuild: {
      jsx: 'automatic'
    },
    server: {
      port: Number(port),
      strictPort: true
    },
    build: {
      rollupOptions: {
        input: 'renderer/index.html'
      }
    },
    plugins: [react({
      jsxRuntime: 'automatic'
    })]
  }
})
