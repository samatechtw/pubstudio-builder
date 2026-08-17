import { IUseSiteSource } from '@pubstudio/frontend/feature-site-store'
import { IReadInput, read } from './read/read'
import { err, ok, Result, toAgentError } from './result'
import { opNames } from './op/op-registry'
import { applyOps, IApplyInput, IApplyOutput } from './tools/apply'
import { describeTools, IDescribeInput, IDescribeResult } from './tools/describe-tools'
import { history, IHistoryInput, IHistoryOutput } from './tools/history'
import { IOrientation, orientation } from './tools/orientation'
import {
  endSession,
  identify,
  IIdentity,
  requireIdentified,
  requireSite,
  startSession,
} from './tools/session'
import { IStatus, status } from './tools/status'

// Tools never throw: a thrown error crossing evaluate_script loses its structure, and
// an agent that gets `{ok:false, error:{code, message}}` can act on it.
const guard = <TIn, TOut>(
  fn: (input: TIn) => TOut,
  requiresIdentity = true,
): ((input: TIn) => Result<TOut>) => {
  return (input: TIn) => {
    try {
      if (requiresIdentity) {
        requireIdentified()
      }
      return ok(fn(input))
    } catch (e) {
      const error = toAgentError(e)
      return err(error.code, error.message, error.details)
    }
  }
}

const guardAsync = <TIn, TOut>(
  fn: (input: TIn) => Promise<Result<TOut>>,
): ((input: TIn) => Promise<Result<TOut>>) => {
  return async (input: TIn) => {
    try {
      requireIdentified()
      return await fn(input)
    } catch (e) {
      const error = toAgentError(e)
      return err(error.code, error.message, error.details)
    }
  }
}

export interface IPubStudioAgentApi {
  version: number
  identify(identity: IIdentity): Result<IOrientation>
  describeTools(input?: IDescribeInput): Result<IDescribeResult>
  read(input: IReadInput): Result<Record<string, unknown>>
  apply(input: IApplyInput): Promise<Result<IApplyOutput>>
  history(input: IHistoryInput): Result<IHistoryOutput>
  status(input?: unknown): Result<IStatus>
  op: Record<string, (input?: unknown) => Promise<Result<IApplyOutput>>>
  /** Same as describeTools({all:true}); built on access so install stays cheap. */
  readonly _meta: IDescribeResult
}

declare global {
  interface Window {
    PubStudio?: IPubStudioAgentApi
  }
}

// Single-op shortcut, generated from the registry: PubStudio.op.setComponentStyle({…})
const opShortcuts = (): IPubStudioAgentApi['op'] =>
  Object.fromEntries(
    opNames().map((name) => [
      name,
      (input?: unknown) => api.apply({ ops: [{ op: name, input }], label: name }),
    ]),
  )

let api: IPubStudioAgentApi

export const installAgentTools = (siteSource: IUseSiteSource): (() => void) => {
  startSession(siteSource)

  api = {
    version: 1,
    identify: guard((input: IIdentity) => {
      if (!input?.client) {
        throw new Error('identify() needs at least { client }.')
      }
      identify(input)
      return orientation()
    }, false),
    describeTools: guard((input?: IDescribeInput) => describeTools(input), false),
    read: guard((input: IReadInput) => read(requireSite(), input)),
    apply: guardAsync(applyOps),
    history: guard(history),
    status: guard((_input?: unknown) => status(), false),
    op: {},
    get _meta() {
      return describeTools({ all: true })
    },
  }
  api.op = opShortcuts()
  window.PubStudio = api

  return () => {
    if (window.PubStudio === api) {
      delete window.PubStudio
    }
    endSession()
  }
}
