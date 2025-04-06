import EventEmitter from 'node:events'

import type { Lifecycle } from 'spirit'

class EE<T extends Record<keyof T, any[]>> {
  #ee = new EventEmitter()
  globalListeners = new Set<(...args: any[]) => void>()

  on<K extends keyof T>(eventName: K, listener: (...args: T[K]) => void): this
  on(listener: <K extends keyof T>(event: K, ...args: T[K]) => void): this
  on(nameOrListener: any, listener?: any): this {
    if (typeof nameOrListener === 'string') {
      this.#ee.on(nameOrListener, listener)
    } else {
      this.globalListeners.add(nameOrListener)
    }
    return this
  }
  once<K extends keyof T>(eventName: K, listener: (...args: T[K]) => void): this
  once(listener: <K extends keyof T>(event: K, ...args: T[K]) => void): this
  once(nameOrListener: any, listener?: any): this {
    if (typeof nameOrListener === 'string') {
      this.#ee.once(nameOrListener, listener)
    } else {
      this.globalListeners.add(nameOrListener)
    }
    return this
  }
  off<K extends keyof T>(eventName: K, listener: (...args: T[K]) => void): this
  off(listener: <K extends keyof T>(event: K, ...args: T[K]) => void): this
  off(nameOrListener: any, listener?: any): this {
    if (typeof nameOrListener === 'string') {
      this.#ee.off(nameOrListener, listener)
    } else {
      this.globalListeners.delete(nameOrListener)
    }
    return this
  }

  emit<K extends keyof T & (string | symbol)>(eventName: K, ...args: T[K]): boolean {
    if (this.globalListeners.size > 0) {
      this.globalListeners.forEach(listener => listener(eventName, ...args))
    }
    return this.#ee.emit(eventName, ...args)
  }
}

export const ee = new EE<Lifecycle>()
