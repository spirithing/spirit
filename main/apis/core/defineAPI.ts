import type { BridgeMethods } from 'spirit'

// @ts-ignore
export const defineAPI = <K extends keyof BridgeMethods>(k: K, v: BridgeMethods[K]) => v
