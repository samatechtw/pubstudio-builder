import { IRgba } from '@pubstudio/frontend/util-gradient'
import { IHsv } from './i-hsv'

export interface IPickerColor {
  rgba: IRgba
  hsv: IHsv
  hex: string
  themeVar?: string
}
