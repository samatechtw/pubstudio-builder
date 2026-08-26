export const collaborationProtocolVersion = 1

export type DocumentSection =
  | 'name'
  | 'version'
  | 'context'
  | 'defaults'
  | 'pages'
  | 'page_order'

export type WirePathSegment = string | { id: string }

export type ExpectedValue = { kind: 'missing' } | { kind: 'value'; value: unknown }

interface IWireCommandBase {
  section: DocumentSection
  path: WirePathSegment[]
}

// `max` merges numeric counters (`context.nextId`) without a precondition so
// concurrent allocations from several tabs never conflict.
export type MergeStrategy = 'max'

export interface ISetWireCommand extends IWireCommandBase {
  type: 'set'
  expected: ExpectedValue
  value: unknown
  merge?: MergeStrategy
}

export interface IDeleteWireCommand extends IWireCommandBase {
  type: 'delete'
  expected: unknown
}

export interface IInsertWireCommand extends IWireCommandBase {
  type: 'insert'
  item_id: string
  item: unknown
  after_id: string | null
  before_id: string | null
}

export interface IRemoveWireCommand extends IWireCommandBase {
  type: 'remove'
  item_id: string
  expected: unknown
}

export interface IMoveWireCommand extends IWireCommandBase {
  type: 'move'
  item_id: string
  expected_after_id: string | null
  expected_before_id: string | null
  after_id: string | null
  before_id: string | null
}

export type WireCommand =
  | ISetWireCommand
  | IDeleteWireCommand
  | IInsertWireCommand
  | IRemoveWireCommand
  | IMoveWireCommand

export interface ICommandBatch {
  protocol_version: number
  batch_id: string
  client_id: string
  base_revision: number
  commands: WireCommand[]
}

export interface IAcceptedOperation extends Omit<ICommandBatch, 'commands'> {
  revision: number
  commands: WireCommand[]
  author_id: string | null
  created_at: string
}

export interface ISubmitBatchResponse {
  operation: IAcceptedOperation
  changed: boolean
  duplicate: boolean
  content_updated_at: number
}

export interface IOperationsResponse {
  current_revision: number
  operation_floor: number
  content_updated_at: number
  operations: IAcceptedOperation[]
  snapshot_required: boolean
}
