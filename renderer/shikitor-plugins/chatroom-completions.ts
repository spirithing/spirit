import { definePlugin } from '@shikitor/core'
import type {} from '@shikitor/core/plugins/provide-completions'
import type { ChatRoom } from 'spirit'

export interface ChatroomCompletionsOptions {
  chatrooms: Pick<ChatRoom, 'id' | 'name' | 'description'>[]
}

export default function chatroomCompletions(options: ChatroomCompletionsOptions) {
  return definePlugin({
    name: 'chatroom-completions',
    async install() {
      const installedDefer = Promise.withResolvers<void>()
      const disposeDepend = this.depend(['provide-completions'], shikitor => {
        shikitor.registerCompletionItemProvider('markdown', {
          triggerCharacters: ['#'],
          provideCompletionItems(_, position) {
            const { chatrooms } = options
            return {
              suggestions: chatrooms.map(target => ({
                label: target.id,
                range: { start: position.offset - 1, end: position.offset - 1 },
                insertText: `#${target.id}`
              }))
            }
          }
        })
        installedDefer.resolve()
      }).dispose
      await installedDefer.promise
      return {
        dispose() {
          disposeDepend?.()
        }
      }
    }
  })
}
