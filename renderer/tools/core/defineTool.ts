import type { Static, TObject } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { ITool } from 'spirit'

export type Tool = ITool & {
  call: (parameters: any) => string | Promise<string>
}

export const t = {
  string: Type.String,
  number: Type.Number,
  boolean: Type.Boolean,
  null: Type.Null,
  undefined: Type.Undefined,
  integer: Type.Integer,
  bigint: Type.BigInt,
  literal: Type.Literal,
  record: Type.Record,
  tuple: Type.Tuple,
  union: Type.Union,
  intersection: Type.Intersect,
  object: Type.Object,
  array: Type.Array,
  any: Type.Any
}

export const defineTool = <S extends TObject, T = Static<S>>(
  parameters: S,
  call: (parameters: NoInfer<T>) => string | Promise<string>
) => ({
  type: 'function',
  function: {
    name: parameters.title ?? 'anonymous',
    description: parameters.description ?? '',
    parameters: {
      type: parameters.type,
      required: parameters.required ?? [],
      properties: parameters.properties ?? {}
    }
  },
  call
} satisfies Tool)
