import type { SelectionsGroup } from '#renderer/atoms/sender.ts'

export const createUseSelectionsGroups = (hook: (keyword: string) => SelectionsGroup[]) => hook
