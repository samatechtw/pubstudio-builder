import { IPickerColor } from '@pubstudio/frontend/feature-color-picker'
import { IThemedGradient } from '@pubstudio/frontend/util-gradient'

export interface IToolbarPickerColor extends IPickerColor {
  prosemirrorWasFocused: boolean
}

export interface IToolbarThemedGradient extends IThemedGradient {
  prosemirrorWasFocused: boolean
}
