import { DataType } from './enum-data-type'
import { RuleType } from './enum-rule-type'

export interface ICustomDataInfoViewModel {
  id: string
  name: string
  columns: string
}

export interface ITableColumn {
  data_type: DataType
  validation_rules: IColumnValidationRule[]
}

export interface IColumnValidationRule {
  rule_type: RuleType
  parameter?: unknown
}
