declare module 'spirit' {
  export interface Actions {
    wechat: [id: string]
  }
  export interface Events {
    act: <T extends keyof Actions>(type: T, ...args: Actions[T]) => void
  }
}
