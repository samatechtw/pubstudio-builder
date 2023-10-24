import { IMultiselectObj, IMultiselectOption } from '@pubstudio/frontend/type-ui-widgets'
import {
  MediaRequirements,
  ValidatedFile,
  Validator,
} from '@pubstudio/frontend/util-validate'
import { ComputedRef, Ref } from 'vue'

// Base interface for field entry
interface IAdminEntry {
  label: string
  subtext?: string
  sublabel?: string
  placeholder?: string
  required?: boolean
  error: string | null
  validators?: Validator[]
  input: string | string[]
}

// Text input field
export type IAdminFieldType = 'text' | 'email' | 'password'

export interface IAdminField extends Omit<IAdminEntry, 'input'> {
  rows?: number
  type?: IAdminFieldType
  input: string
}

// Select/option field
export type IAdminSelectOption = IMultiselectOption
export interface IAdminSelect extends Omit<IAdminEntry, 'input'> {
  options: (string[] | IAdminSelectOption[]) | Ref<IAdminSelectOption[]>
  input: IMultiselectObj | undefined
}

// Multi-select field
export interface IAdminMultiSelect extends Omit<IAdminEntry, 'input'> {
  options: (string[] | IAdminSelectOption[]) | Ref<IAdminSelectOption[]>
  input: string[]
}

// Datepicker field
export interface IAdminDate extends Omit<IAdminEntry, 'input'> {
  lowerLimit?: Date | ComputedRef<Date | undefined>
  upperLimit?: Date | ComputedRef<Date | undefined>
  input: string
}

export type IAdminCheck = Omit<IAdminEntry, 'input' | 'error'> & {
  checked: boolean
  input: string
}

// Asset upload field
export interface IAdminAsset extends Omit<IAdminEntry, 'input'> {
  file?: ValidatedFile
  // Whether to optimize the asset with image-api
  optimize?: boolean
  // URL for uploading asset to S3
  url?: string
  requirements: MediaRequirements
  input: string
}

export type IAdminAnyField =
  | IAdminAsset
  | IAdminDate
  | IAdminField
  | IAdminSelect
  | IAdminMultiSelect
  | IAdminCheck

// Collection of Admin fields
export type IAdminForm = Record<string, IAdminAnyField>

// Helper interfaces for generic field generation
export type IAdminFieldOptional = Partial<IAdminField> & {
  label: string
  type?: IAdminFieldType
}
export type IAdminSelectOptional = Partial<IAdminSelect> & {
  label: string
  options: (string[] | IAdminSelectOption[]) | Ref<IAdminSelectOption[]>
}
export type IAdminMultiSelectOptional = Partial<IAdminMultiSelect> & {
  label: string
  options: (string[] | IAdminSelectOption[]) | Ref<IAdminSelectOption[]>
}
export type IAdminCheckOptional = Partial<IAdminCheck> & {
  label: string
  checked: boolean
}
export type IAdminDateOptional = Partial<IAdminDate> & { label: string }
export type IAdminAssetOptional = Partial<IAdminAsset> & { label: string }
