export interface IFieldEqFilter {
  field: string
  value: string
}

export interface IRowFilters {
  field_eq?: IFieldEqFilter
}
