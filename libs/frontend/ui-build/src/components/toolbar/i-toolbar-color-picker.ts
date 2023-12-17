import { IPickerColor } from '@pubstudio/frontend/feature-color-picker'
import { IThemedGradient } from '@pubstudio/frontend/util-gradient'

export interface IToolbarPickerColor extends IPickerColor {
  textWasFocused: boolean
}

export interface IToolbarThemedGradient extends IThemedGradient {
  textWasFocused: boolean
}
