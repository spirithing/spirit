import type { EventMap } from '../utils/EventEmitter'

declare module 'spirit' {
  export interface Events extends EventMap {
  }
}
