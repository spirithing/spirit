import { memoize } from './memoize'
import { isMac, isWindows } from './system'

export default memoize(async function getIcon(
  path: string,
  { size }: { size?: number } = {}
): Promise<string | null> {
  if (isMac) {
    return import('./getIcon.darwin').then((module) => module.default(path, { size }))
  }
  if (isWindows) {
    return import('./getIcon.windows').then((module) => module.default(path))
  }
  return null
})
