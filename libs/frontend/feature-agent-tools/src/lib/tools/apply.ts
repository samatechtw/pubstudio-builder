import { applyCommand, pushAppliedGroup } from '@pubstudio/frontend/data-access-command'
import { latestBehaviorId, latestStyleId } from '@pubstudio/frontend/util-ids'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  IAddComponentData,
  IAddPageData,
  IAddStyleMixinData,
  ICommandGroupData,
  ISetBehaviorData,
} from '@pubstudio/shared/type-command-data'
import { ISite, SiteSaveState } from '@pubstudio/shared/type-site'
import { nextTick } from 'vue'
import { IOpCtx } from '../op/define-op'
import { findOp } from '../op/op-registry'
import { AgentError, IAgentError, Result, toAgentError } from '../result'
import { parseSchema } from '../schema/schema'
import {
  defaultBreakpointId,
  formatSaveError,
  lastSavedAt,
  requireEditable,
  requireSite,
  saveError,
  saveState,
  siteSource,
} from './session'

export const MAX_OPS = 200

export type SaveMode = 'debounced' | 'immediate' | 'none'

export interface IApplyOpInput {
  op: string
  input?: unknown
}

export interface IApplyInput {
  ops: IApplyOpInput[]
  /** Short description of the batch, recorded with the history entry. */
  label?: string
  save?: SaveMode
}

export interface IApplyOutput {
  commandCount: number
  undoSteps: number
  createdComponentIds: string[]
  createdMixinIds: string[]
  createdBehaviorIds: string[]
  createdPageRoutes: string[]
  saveState?: SiteSaveState
  /** Last save attempt failed with this; `saveState` still reads `saved` when it does. */
  saveError?: string
  lastSavedAt?: number
  /** True when a resolver failed partway; ops before failedIndex ARE applied. */
  partial?: boolean
  applied?: number
  remaining?: number
}

const emptyOutput = (): IApplyOutput => ({
  commandCount: 0,
  undoSteps: 0,
  createdComponentIds: [],
  createdMixinIds: [],
  createdBehaviorIds: [],
  createdPageRoutes: [],
})

// Ids are allocated during apply, so they are collected per command right after it runs
const collectCreated = (site: ISite, command: ICommand, out: IApplyOutput) => {
  switch (command.type) {
    case CommandType.Group:
      for (const child of (command.data as ICommandGroupData).commands) {
        collectCreated(site, child, out)
      }
      break
    case CommandType.AddComponent: {
      const id = (command.data as IAddComponentData).id
      if (id) out.createdComponentIds.push(id)
      break
    }
    case CommandType.AddStyleMixin:
      out.createdMixinIds.push(
        (command.data as IAddStyleMixinData).id ?? latestStyleId(site.context),
      )
      break
    case CommandType.SetBehavior: {
      const { oldBehavior, newBehavior } = command.data as ISetBehaviorData
      if (newBehavior && !oldBehavior) {
        out.createdBehaviorIds.push(newBehavior.id ?? latestBehaviorId(site.context))
      }
      break
    }
    case CommandType.AddPage: {
      const { route } = (command.data as IAddPageData).metadata
      out.createdPageRoutes.push(route)
      // The page root is created inside the command, not by an AddComponent, but the
      // agent needs its id to put anything on the new page
      const rootId = site.pages[route]?.root.id
      if (rootId) out.createdComponentIds.push(rootId)
      break
    }
  }
}

const toArray = (commands: ICommand | ICommand[]): ICommand[] =>
  Array.isArray(commands) ? commands : [commands]

interface IValidatedOp {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (ctx: IOpCtx) => ICommand | ICommand[]
}

// Validation is atomic: one bad op means nothing is applied
const validate = (ops: IApplyOpInput[]): IValidatedOp[] => {
  const issues: { path: string; message: string }[] = []
  const validated: IValidatedOp[] = []
  ops.forEach((entry, i) => {
    const op = findOp(entry.op)
    if (!op) {
      issues.push({
        path: `ops[${i}].op`,
        message: `unknown op "${entry.op}"; call describe() for the list`,
      })
      return
    }
    const parsed = parseSchema(op.input, entry.input ?? {}, `ops[${i}].input`)
    if (!parsed.ok) {
      issues.push(...parsed.issues)
      return
    }
    validated.push({ name: op.name, resolve: (ctx) => op.resolve(ctx, parsed.value) })
  })
  if (issues.length) {
    throw new AgentError('INVALID_INPUT', 'One or more ops failed validation.', issues)
  }
  return validated
}

const flushRender = async () => {
  await nextTick()
  await new Promise((resolve) => requestAnimationFrame(resolve))
}

export const applyOps = async (input: IApplyInput): Promise<Result<IApplyOutput>> => {
  const site = requireSite()
  requireEditable()
  if (!Array.isArray(input?.ops)) {
    throw new AgentError('INVALID_INPUT', 'apply() needs an `ops` array.')
  }
  if (input.ops.length > MAX_OPS) {
    throw new AgentError(
      'TOO_LARGE',
      `apply() takes at most ${MAX_OPS} ops; got ${input.ops.length}. Split the batch.`,
    )
  }
  const validated = validate(input.ops)

  const warnings: string[] = []
  const out = emptyOutput()
  const applied: ICommand[] = []
  const ctx: IOpCtx = {
    site,
    breakpointId: defaultBreakpointId(),
    warn: (message) => warnings.push(message),
  }

  let failure: IAgentError | undefined
  let failedIndex = -1
  for (let i = 0; i < validated.length; i += 1) {
    try {
      // Apply as we go so op i+1 resolves against the state op i produced
      for (const command of toArray(validated[i].resolve(ctx))) {
        applyCommand(site, command)
        collectCreated(site, command, out)
        applied.push(command)
      }
    } catch (e) {
      failure = toAgentError(e)
      failure.details = {
        ...(typeof failure.details === 'object' ? failure.details : {}),
        failedIndex: i,
        failedOp: validated[i].name,
      }
      failedIndex = i
      break
    }
  }

  if (applied.length) {
    pushAppliedGroup(site, applied, input.label)
    out.commandCount = applied.length
    out.undoSteps = 1
  }
  if (failure) {
    out.partial = applied.length > 0
    out.applied = failedIndex
    out.remaining = validated.length - failedIndex
  }

  const save = input.save ?? 'debounced'
  if (save === 'immediate' && applied.length) {
    await siteSource().siteStore.save(site, { immediate: true })
  }
  if (save !== 'none') {
    out.saveState = saveState()
    out.lastSavedAt = lastSavedAt()
    // Includes a failure from an earlier debounced save, so a batching agent sees it on
    // the next call rather than at the end of the build.
    out.saveError = formatSaveError(saveError())
    if (out.saveError) {
      warnings.push(
        `Site NOT saved: ${out.saveError}. Edits exist only in this browser tab — ` +
          'resolve the conflict in the builder before continuing.',
      )
    }
  }
  await flushRender()

  if (failure) {
    return { ok: false, error: failure, result: out }
  }
  return warnings.length ? { ok: true, result: out, warnings } : { ok: true, result: out }
}
