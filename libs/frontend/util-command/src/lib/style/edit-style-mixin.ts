import { resolveStyle } from '@pubstudio/frontend/util-builtin'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IEditStyleMixinData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { setEditingMixin } from '../edit-styles-data'

export interface EditStyleMixin extends ICommand<IEditStyleMixinData> {
  type: CommandType.EditStyleMixin
}

export const applyEditStyleMixin = (site: ISite, data: IEditStyleMixinData) => {
  const { id, newName } = data
  const style = resolveStyle(site.context, id)
  if (style) {
    style.name = newName
  }
}

export const undoEditStyleMixin = (site: ISite, data: IEditStyleMixinData) => {
  const { id, oldName } = data
  const style = resolveStyle(site.context, id)
  if (style) {
    style.name = oldName
    setEditingMixin(site, id)
  }
}
