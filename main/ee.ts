import EventEmitter from 'node:events'

import type { Lifecycle } from 'spirit'

export const ee = new EventEmitter<Lifecycle>()
