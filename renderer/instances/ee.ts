import type { Events } from 'spirit'

import { EventEmitter } from '../utils/EventEmitter'

export const ee = new EventEmitter<Events>()
