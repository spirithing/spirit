import type { Selection } from '#renderer/atoms/sender.ts'

export const defineSelectionsProviderHook = (hook: (keyword: string) => Selection[]) => hook
