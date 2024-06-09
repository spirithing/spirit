declare module 'spirit' {
  export interface Common {
    locale: string | 'system'
    theme?: string
    layout?: string
  }
  export interface User {
    name: string
  }
  export interface Store {
    common: Common
    user: User
  }
}
