import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

import pkg from './package.json'

process.env.VITE_APP_VERSION = pkg.version
process.env.VITE_BUILD_TIME = String(Date.now())

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: 'main/index.ts'
      }
    },
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
    build: {
      rollupOptions: {
        input: 'index.html'
      }
    },
    plugins: [react()]
  }
})
