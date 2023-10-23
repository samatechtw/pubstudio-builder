export type IMultiselectObj =
  | { label: string; value: string }
  | { [key: string]: unknown }
export type IMultiselectOption = string | IMultiselectObj
export type IMultiselectOptions = IMultiselectOption[]
