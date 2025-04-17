declare module 'spirit' {
  interface MainEventMapForConsole extends Record<string, unknown[]> {}
  interface MainEventMap {
    console: MainEventMapForConsole
  }
}
