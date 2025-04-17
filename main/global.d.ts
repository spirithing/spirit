/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ELECTRON_RENDERER_URL: string

  /**
   * Whether to open the dev tools automatically when the app starts
   */
  readonly VITE_MAIN_AUTO_OPEN_DEV_TOOLS: string

  readonly VITE_MAIN_LARK_USER_ACCESS_TOKEN: string
  readonly VITE_MAIN_LARK_APP_ID: string
  readonly VITE_MAIN_LARK_APP_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
