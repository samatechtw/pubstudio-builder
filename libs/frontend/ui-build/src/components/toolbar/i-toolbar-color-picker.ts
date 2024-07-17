import { IPickerColor, IThemedGradient } from '@samatech/vue-color-picker'

export interface IToolbarPickerColor {
  color: IPickerColor | undefined
  textWasFocused: boolean
}

export interface IToolbarThemedGradient {
  gradient: IThemedGradient | undefined
  textWasFocused: boolean
}
