import { useEffect } from 'react'

import { useEventCallback } from './useEventCallback'

export function useEventListener<K extends keyof DocumentEventMap>(
  type: K,
  listener: (this: Document, ev: DocumentEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) {
  const lis = useEventCallback(listener)
  useEffect(() => {
    document.addEventListener(type, lis, options)
    return () => {
      document.removeEventListener(type, lis, options)
    }
  }, [type, lis, options])
}
