import { IHsv } from './i-hsv'
import { IRgba } from './i-rgba'

export interface IPickerColor {
  rgba: IRgba
  hsv: IHsv
  hex: string
}
