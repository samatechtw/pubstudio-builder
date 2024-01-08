import { resolveStyle } from '@pubstudio/frontend/util-builtin'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IRemoveStyleMixinData } from '@pubstudio/shared/type-command-data'
import { ISite, IStyle } from '@pubstudio/shared/type-site'

export interface RemoveStyleMixin extends ICommand<IRemoveStyleMixinData> {
  type: CommandType.RemoveStyleMixin
}

export const applyRemoveStyleMixin = (site: ISite, data: IRemoveStyleMixinData) => {
  const context = site.context
  const { id } = data
  const style = resolveStyle(context, id)
  if (style) {
    delete context.styles[id]
  }
}

// We can almost reuse `applyAddStyleMixin`, but we don't want to generate a new ID
// and we need to recover the children
export const undoRemoveStyleMixin = (site: ISite, data: IRemoveStyleMixinData) => {
  const context = site.context
  const { id, name, breakpoints } = data
  const newStyle: IStyle = {
    id,
    name: name ?? id,
    breakpoints,
  }
  context.styles[id] = newStyle
}
