import type { AppName } from 'open'

type AbsolutePath =
  | `/${string}`
  | `${string}://${string}`

declare module 'spirit' {
  interface BrowserParams {
    testType?: boolean
    ignoreCertificateErrors?: boolean

    lang?: string
    noFirstRun?: boolean
    startMaximized?: boolean
    Kiosk?: boolean
    windowSize?: [number, number]
    windowPosition?: [number, number]

    disableBackgroundNetworking?: boolean

    enableSync?: boolean
    noProxyServer?: boolean
    proxyAutoDetect?: boolean
    proxyServer?: string

    userDataDir?: string
    profileDirectory?: string
    diskCacheDir?: string
    diskCacheSize?: number

    disableWebSecurity?: boolean
    disablePopupBlocking?: boolean
    disableJavaScript?: boolean
    disableImages?: boolean
    disableExtensions?: boolean

    singleProcess?: boolean
    processPerTab?: boolean
    processPerSite?: boolean
    inProcessPlugins?: boolean
  }
  interface BridgeMethods {
    openBrowser(url: string, options?: {
      readonly args?: readonly string[]
      readonly overrideArgs?: readonly string[]
      readonly params?: BrowserParams
      readonly overrideParams?: BrowserParams
      readonly wait?: boolean
      readonly background?: boolean
      readonly newInstance?: boolean
      /**
       * delay in ms
       * @default 0
       */
      readonly delay?: number
    }): Promise<void>
  }
  interface BridgeSyncMethods {
    setDefaultBrowser(
      browser: 'default' | AppName | AbsolutePath
    ): void
    setBrowserDefaultArgs(args: string[]): void
    setBrowserDefaultParams(params: BrowserParams): void
    resetBrowserDefaultSettings(): void
  }
  interface Store {
  }
}

export {}
