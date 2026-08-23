import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISite } from '@pubstudio/shared/type-site'
import { Schema } from '../schema/schema'

export interface IOpCtx {
  site: ISite
  // Breakpoint used when an op omits one
  breakpointId: string
  warn(message: string): void
}

export interface IOpDef<
  TData,
  TInput,
  TDerived extends keyof TData,
  TOmitted extends Partial<Record<keyof TData, string>>,
> {
  /** Agent-facing name, e.g. 'setComponentStyle'. Unique across the registry. */
  name: string
  command: CommandType
  title: string
  /** Used be describeTools() generated docs. */
  description: string
  input: Schema<TInput>
  /** Command data fields derived from live site state — the undo half. */
  derived: readonly TDerived[]
  /** Fields deliberately not exposed, each with a reason that lands in the docs. */
  omitted: TOmitted
  // NoInfer keeps `input` the only place TInput is inferred from
  resolve(ctx: IOpCtx, input: NoInfer<TInput>): ICommand | ICommand[]
  /** Sample input against a site; powers the round-trip test and the docs. */
  example(site: ISite): NoInfer<TInput>
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnyOpDef = IOpDef<any, any, any, any>
/* eslint-enable @typescript-eslint/no-explicit-any */

// Identity helper. The TData binding is explicit so `derived`/`omitted` are checked
// against the command data type, while everything else is inferred.
export const defineOp =
  <TData>() =>
  <
    TInput,
    TDerived extends keyof TData,
    TOmitted extends Partial<Record<keyof TData, string>>,
  >(
    def: IOpDef<TData, TInput, TDerived, TOmitted>,
  ): IOpDef<TData, TInput, TDerived, TOmitted> =>
    def

export interface IExcludedOp {
  excluded: true
  reason: string
}

export const excluded = (reason: string): IExcludedOp => ({ excluded: true, reason })

export type OpEntry = AnyOpDef | IExcludedOp

export const isOp = (entry: OpEntry): entry is AnyOpDef => !('excluded' in entry)
