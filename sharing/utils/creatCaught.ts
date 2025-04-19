/**
 * @example
 * ```ts
 * try {
 *   const caught = createCaught()
 *   ...
 *   const t = setTimeout(...)
 *   using _ = caught.only({ [Symbol.dispose]: () => clearTimeout(t) })
 *   ...
 *   caught.not()
 * } catch { ... }
 * ```
 */
export const creatCaught = () => {
  let catchError = true
  return {
    not: () => catchError = false,
    only: <D extends Disposable | AsyncDisposable>(d: D): D => {
      const returnD = {} as D
      if (Symbol.dispose in d) {
        returnD[Symbol.dispose] = () => catchError && d[Symbol.dispose]()
      }
      if (Symbol.asyncDispose in d) {
        returnD[Symbol.asyncDispose] = () => catchError && d[Symbol.asyncDispose]()
      }
      return returnD
    }
  }
}
