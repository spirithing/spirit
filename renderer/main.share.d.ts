declare module 'spirit' {
  namespace webview {
    interface KeyBoardEvent {
      key: string
      code: string
      altKey: boolean
      ctrlKey: boolean
      metaKey: boolean
      shiftKey: boolean
    }
  }
  interface WebviewEventMap {
    keyup: [webview.KeyBoardEvent]
    keydown: [webview.KeyBoardEvent]
    keypress: [webview.KeyBoardEvent]
  }
}
