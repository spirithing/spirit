/// <reference types="vitest" />
import { config } from 'dotenv'
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    setupFiles: ['dotenv/config'],
    env: {
      ...config().parsed,
      ...config({ path: '.test.env' }).parsed,
      ...config({ path: '.test.local.env' }).parsed
    }
  }
})
