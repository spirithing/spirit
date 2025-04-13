import fs from 'node:fs'

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
    let plistFilePath = `${path}/Contents/Info.plist`
    try {
      if (!fs.existsSync(plistFilePath)) {
        if (fs.existsSync(`${path}/Wrapper`)) {
          const file = (await fs.promises.readdir(`${path}/Wrapper`)).find(f => f.endsWith('.app'))
          if (file) {
            plistFilePath = `${path}/Wrapper/${file}/Info.plist`
          }
        }
      }
      CFBundleIconFile = plist.readFileSync<{
        CFBundleIconFile?: string | null
      }>(plistFilePath).CFBundleIconFile
    } catch (e) {
      console.error(`${import.meta.url}:`, { path, plistFilePath, e })
      return null
    }

    if (!CFBundleIconFile) {
      return null
    }

    const iconFileName = /\.(icns|tiff|png|jpg|jpeg|gif)$/.test(CFBundleIconFile)
      ? CFBundleIconFile
      : `${CFBundleIconFile}.icns`
    const iconFilePath = `${path}/Contents/Resources/${iconFileName}`
    try {
      const icon = await nativeImage.createThumbnailFromPath(iconFilePath, s)
      return icon.toDataURL()
    } catch (e) {
      console.error(`${import.meta.url}:`, { path, iconFilePath, e })
      return null
    }
  }
}
