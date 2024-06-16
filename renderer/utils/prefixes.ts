export type WithPrefixProps<T, Prefix extends string> = {
  [K in keyof T as `${Prefix}:${K & string}`]: T[K]
}

export type PickPrefixProps<T, Prefix extends string> = {
  [K in keyof T as K extends `${Prefix}:${string}` ? K : never]: T[K]
}

export type OmitPrefixProps<T, Prefix extends string> = {
  [K in keyof T as K extends `${Prefix}:${string}` ? never : K]: T[K]
}

export type TrimPrefixProps<T, Prefix extends string> = {
  [K in keyof T as K extends `${Prefix}:${infer R}` ? R : K]: NonNullable<T[K]>
}

export function omitPrefixProps<T, P extends string>(
  props: T,
  prefix: P
): [PickPrefixProps<T, P>, OmitPrefixProps<T, P>] {
  const _prefix = `${prefix}:`
  const pick: any = {}
  const omit: any = {}
  for (const key in props) {
    if (key.startsWith(_prefix)) {
      pick[key] = props[key]
    } else {
      omit[key] = props[key]
    }
  }
  return [pick, omit]
}

export function trimPrefixProps<T, P extends string>(props: T, prefix: P): TrimPrefixProps<T, P> {
  const _prefix = `${prefix}:`
  const trimmed: any = {}
  for (const key in props) {
    if (key.startsWith(_prefix)) {
      trimmed[key.slice(_prefix.length)] = props[key]
    } else {
      trimmed[key] = props[key]
    }
  }
  return trimmed
}
