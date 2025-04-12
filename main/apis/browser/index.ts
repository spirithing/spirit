import path from 'node:path'

import open, { apps } from 'open'

import { defineAPI } from '../core/defineAPI'

function kebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

function params2Args(params: Record<string, any>) {
  return Object.entries(params)
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return `--${kebabCase(key)}`
      }
      return `--${kebabCase(key)}="${Array.isArray(value) ? value.join(',') : value}"`
    })
}

let defaultBrowser = apps.browser
let defaultBrowserArgs: string[] = []
let defaultBrowserParams: Record<string, any> = {}

export const openBrowser = defineAPI('openBrowser', async (url, options = {}) => {
  const { wait, background, newInstance, delay = 0 } = options
  if (delay > 0) {
    await new Promise(ok => setTimeout(ok, delay))
  }
  const {
    args = [],
    overrideArgs,
    params,
    overrideParams
  } = options
  let endArguments: readonly string[]
  if (overrideArgs) {
    endArguments = overrideArgs
  } else if (args) {
    endArguments = [...defaultBrowserArgs, ...args]
  } else {
    endArguments = [...defaultBrowserArgs]
  }
  if (overrideParams) {
    endArguments = [...endArguments, ...params2Args(overrideParams)]
  } else if (params) {
    endArguments = [...endArguments, ...params2Args({ ...defaultBrowserParams, ...params })]
  } else {
    endArguments = [...endArguments, ...params2Args(defaultBrowserParams)]
  }
  await open(url, {
    wait,
    background,
    newInstance,
    app: { name: defaultBrowser, arguments: endArguments }
  })
})

export const setDefaultBrowser = defineAPI('setDefaultBrowser', (browser) => {
  if (browser === 'default') {
    defaultBrowser = apps.browser
    return
  }
  if (path.isAbsolute(browser)) {
    defaultBrowser = browser
    return
  }
  defaultBrowser = apps[browser] ?? browser
})

export const setDefaultBrowserArgs = defineAPI('setBrowserDefaultArgs', (args) => {
  defaultBrowserArgs = args
})

export const setDefaultBrowserParams = defineAPI('setBrowserDefaultParams', (params) => {
  defaultBrowserParams = params
})

export const resetDefaultBrowserSettings = defineAPI('resetBrowserDefaultSettings', () => {
  defaultBrowser = apps.browser
  defaultBrowserArgs = []
  defaultBrowserParams = {}
})
