export type ClipboardItemBase = {
  uuid: string
  from: string
  ctime: number
  uptime?: number
}

export type ClipboardItemUnion =
  | {
    type: 'text'
    text: string
  }
  | {
    type: 'html'
    html: string
  }
  | {
    type: 'rtf'
    rtf: string
  }
  | {
    type: 'bookmark'
    bookmark: {
      title: string
      url: string
    }
  }
  | {
    type: 'image'
    /**
     * base64 image data
     */
    image: string
  }

export type ClipboardItem =
  & ClipboardItemBase
  & ClipboardItemUnion

declare module 'spirit' {
  interface BridgeMethods {
    appendToClipboard(
      itemOrText: ClipboardItemUnion | string
    ): Promise<void>
    delClipboards(uuids: string[]): Promise<void>
    updClipboard(uuid: string): Promise<void>
    getClipboards<T extends ClipboardItemUnion['type']>(query: {
      text?: string
      type?: T
      range?: [number | undefined, number | undefined]
    }, options: {
      /**
       * @default 0
       */
      page?: number
      /**
       * @default 10
       */
      size?: number
    }): Promise<{
      count: number
      value: (ClipboardItem & { type: T })[]
    }>
  }
  interface Store {
    clipboards?: ClipboardItem[]
  }
}

export {}
