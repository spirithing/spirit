import { nativeImage } from 'electron'
import plist from 'simple-plist'

// eslint-disable-next-line react/display-name
export default async function(path: string, { size = 32 } = {}) {
  const s = { width: size, height: size }
  if (!path.endsWith('.app') && !path.endsWith('.app/')) {
    const icon = await nativeImage.createThumbnailFromPath(path, s)
    return icon.toDataURL()
  } else {
    let CFBundleIconFile: string | null | undefined
    try {
      CFBundleIconFile = plist.readFileSync<{
        CFBundleIconFile?: string | null
      }>(`${path}/Contents/Info.plist`).CFBundleIconFile
    } catch (e) {
      console.error(e)
      return null
    }

    if (!CFBundleIconFile) {
      return null
    }

    const iconFileName = CFBundleIconFile.endsWith('.icns')
      ? CFBundleIconFile
      : `${CFBundleIconFile}.icns`
    const icon = await nativeImage
      .createThumbnailFromPath(`${path}/Contents/Resources/${iconFileName}`, s)
    return icon.toDataURL()
  }
}
