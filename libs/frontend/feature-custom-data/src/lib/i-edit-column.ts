import {
  ICustomTableColumn,
  ICustomTableColumnRule,
  ICustomTableColumnRuleType,
} from '@pubstudio/shared/type-api-site-custom-data'

export interface IEditColumnName {
  oldName: string
  newName: string
}

export interface IEditTableColumnRule extends Omit<ICustomTableColumnRule, 'parameter'> {
  parameter?: string
}

export interface IEditTableColumn extends Omit<ICustomTableColumn, 'validation_rules'> {
  validators: { [key in ICustomTableColumnRuleType]?: IEditTableColumnRule }
}
