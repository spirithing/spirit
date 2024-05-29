import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

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
