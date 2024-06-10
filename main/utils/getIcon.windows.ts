import { app } from 'electron'

export default async function(path: string) {
  const nativeIcon = await app.getFileIcon(path)
  return nativeIcon.toDataURL()
}
