/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAIN_LARK_USER_ACCESS_TOKEN: string
  readonly VITE_MAIN_LARK_APP_ID: string
  readonly VITE_MAIN_LARK_APP_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
