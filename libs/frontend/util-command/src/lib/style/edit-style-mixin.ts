import { resolveStyle } from '@pubstudio/frontend/util-builtin'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IEditStyleMixinData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export interface EditStyleMixin extends ICommand<IEditStyleMixinData> {
  type: CommandType.EditStyleMixin
}

export const applyEditStyleMixin = (site: ISite, data: IEditStyleMixinData) => {
  const { oldStyle, newStyle } = data
  const style = resolveStyle(site.context, oldStyle.id)
  if (style) {
    style.name = newStyle.name
    style.breakpoints = newStyle.breakpoints
  }
}

export const undoEditStyleMixin = (site: ISite, data: IEditStyleMixinData) => {
  const { oldStyle, newStyle } = data
  const style = resolveStyle(site.context, newStyle.id)
  if (style) {
    style.name = oldStyle.name
    style.breakpoints = oldStyle.breakpoints
  }
}
