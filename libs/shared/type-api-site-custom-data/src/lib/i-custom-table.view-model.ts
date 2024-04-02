// Parsed version of ICustomDataInfoViewModel

export type ICustomTableColumnRuleType = 'Unique' | 'Email' | 'MinLength' | 'MaxLength'

export interface ICustomTableColumnRule {
  parameter?: number
  rule_type: ICustomTableColumnRuleType
}

export interface ICustomTableColumn {
  name: string
  data_type: 'TEXT'
  validation_rules: ICustomTableColumnRule[]
}

export type ICustomTableColumns = Record<string, ICustomTableColumn>

export interface ICustomTableViewModel {
  id: string
  name: string
  columns: ICustomTableColumn[]
}
