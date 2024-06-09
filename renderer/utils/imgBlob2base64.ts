/**
 * @param type 'image/png' | 'image/jpeg' | 'image/webp'
 * @param blob
 */
export function imgBlob2base64(type: string, blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const { result } = reader
      if (typeof result !== 'string') {
        reject(new Error('Failed to read file'))
        return
      }
      const base64 = result.split(',')[1]
      if (!base64) {
        reject(new Error('Failed to read file'))
        return
      }
      resolve(`data:${type};base64,${base64}`)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
