export type AgentErrorCode =
  | 'NOT_IDENTIFIED'
  | 'NOT_READY'
  | 'READ_ONLY'
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'CONSTRAINT'
  | 'TOO_LARGE'
  | 'INTERNAL'

export interface IAgentError {
  code: AgentErrorCode
  message: string
  details?: unknown
}

export interface IOkResult<T> {
  ok: true
  result: T
  warnings?: string[]
}

export interface IErrResult<T> {
  ok: false
  error: IAgentError
  // Only apply() sets this, and only when some ops were applied before the failure
  result?: T
}

export type Result<T> = IOkResult<T> | IErrResult<T>

// Thrown inside op resolvers and tool handlers; never escapes the window API
export class AgentError extends Error {
  constructor(
    readonly code: AgentErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AgentError'
  }
}

export const ok = <T>(result: T, warnings?: string[]): IOkResult<T> =>
  warnings?.length ? { ok: true, result, warnings } : { ok: true, result }

export const err = <T>(
  code: AgentErrorCode,
  message: string,
  details?: unknown,
): IErrResult<T> => ({ ok: false, error: { code, message, details } })

export const toAgentError = (e: unknown): IAgentError => {
  if (e instanceof AgentError) {
    return { code: e.code, message: e.message, details: e.details }
  }
  return { code: 'INTERNAL', message: e instanceof Error ? e.message : String(e) }
}
