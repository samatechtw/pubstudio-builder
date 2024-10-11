export type ICustomTableColumnRuleType =
  | 'Unique'
  | 'Required'
  | 'Email'
  | 'MinLength'
  | 'MaxLength'

export type ICustomTableDataType = 'TEXT'

export interface ICustomTableColumnRule {
  parameter?: number
  rule_type: ICustomTableColumnRuleType
}

export interface ICustomTableColumn {
  name: string
  default?: string
  data_type: ICustomTableDataType
  validation_rules: ICustomTableColumnRule[]
}

export type ICustomTableColumns = Record<string, ICustomTableColumn>

export interface ICustomTableEvent {
  event_type: ICustomTableEventType
  trigger: ICustomTableEventTrigger
  options: unknown
}

export interface EmailRowOptions {
  recipients: string[]
}

export type ICustomTableEventType = 'EmailRow'
export type ICustomTableEventTrigger = 'AddRow' | 'UpdateRow'

export interface ICustomTableViewModel {
  id: string
  name: string
  columns: ICustomTableColumns
  events: ICustomTableEvent[]
}
