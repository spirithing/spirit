import { useCallback } from 'react'

export const useCtxCallback = <C, F extends (this: C, ...args: any) => unknown>(
  ctxRef: { current: C },
  callback: F
) =>
  useCallback(
    (...args: any) => callback.call(ctxRef.current, ...args),
    [callback, ctxRef]
  ) as (...args: Parameters<F>) => ReturnType<F>
