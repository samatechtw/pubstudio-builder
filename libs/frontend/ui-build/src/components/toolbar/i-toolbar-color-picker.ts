import { IPickerColor } from '@pubstudio/frontend/feature-color-picker'
import { IThemedGradient } from '@pubstudio/frontend/util-gradient'

export interface IToolbarPickerColor {
  color: IPickerColor | undefined
  textWasFocused: boolean
}

export interface IToolbarThemedGradient {
  gradient: IThemedGradient | undefined
  textWasFocused: boolean
}
