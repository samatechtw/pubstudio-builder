export enum CustomDataAction {
  CreateTable = 'CreateTable',
  UpdateTable = 'UpdateTable',
  AddRow = 'AddRow',
  GetRow = 'GetRow',
  RemoveRow = 'RemoveRow',
  ListTables = 'ListTables',
  ListRows = 'ListRows',
  UpdateRow = 'UpdateRow',
  AddColumn = 'AddColumn',
  RemoveColumn = 'RemoveColumn',
  ModifyColumn = 'ModifyColumn',
  DeleteTable = 'DeleteTable',
}

export type CustomDataActionType = `${CustomDataAction}`
