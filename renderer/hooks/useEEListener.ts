import { useEffect } from 'react'
import type { Events } from 'spirit'

import { ee } from '../instances/ee'
import { useEventCallback } from './useEventCallback'

export const useEEListener = <K extends keyof Events>(k: K, lis: Events[K]) => {
  const eventCallbackLis = useEventCallback(lis)
  useEffect(() => ee.on(k, eventCallbackLis), [k, eventCallbackLis])
}
