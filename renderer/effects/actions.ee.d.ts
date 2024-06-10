declare module 'spirit' {
  export interface Actions {
    open: [path: string]
  }
  export interface Events {
    act: <T extends keyof Actions>(type: T, ...args: Actions[T]) => void
  }
}
