export const parseJSON = async function*<T = unknown>(
  itr: ReadableStream<Uint8Array>,
  parse: (text: string) => T = JSON.parse
): AsyncGenerator<T> {
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  const reader = itr.getReader()

  while (true) {
    const { done, value: chunk } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(chunk)

    const parts = buffer.split('\n')

    buffer = parts.pop() ?? ''

    for (const part of parts) {
      if (part === '') continue
      try {
        yield parse(part)
      } catch (error) {
        console.warn('invalid json: ', part)
      }
    }
  }

  const parts = buffer.split('\n').filter((p) => p !== '')
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    try {
      const parsedPart = JSON.parse(part)
      if (i === parts.length - 1) {
        return parsedPart
      } else {
        yield parsedPart
      }
    } catch (error) {
      console.warn('invalid json: ', part)
    }
  }
}
