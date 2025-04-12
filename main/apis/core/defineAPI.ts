import type { BridgeMethods, BridgeSyncMethods } from 'spirit'

export const defineAPI = <K extends keyof BridgeMethods | keyof BridgeSyncMethods>(
  // @ts-ignore
  k: K,
  v: (BridgeMethods & BridgeSyncMethods)[K]
) => v
