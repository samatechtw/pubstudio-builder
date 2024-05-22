import { resolveStyle } from '@pubstudio/frontend/util-resolve'
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
  // Remove from styleOrder and remember index
  const orderIndex = context.styleOrder.indexOf(id)
  data.orderIndex = orderIndex
  context.styleOrder.splice(orderIndex, 1)
}

// We can almost reuse `applyAddStyleMixin`, but we don't want to generate a new ID
// and we need to recover the children
export const undoRemoveStyleMixin = (site: ISite, data: IRemoveStyleMixinData) => {
  const context = site.context
  const { id, name, breakpoints, orderIndex } = data
  const newStyle: IStyle = {
    id,
    name: name ?? id,
    breakpoints,
  }
  context.styles[id] = newStyle

  // Add back to styleOrder at the correct position
  if (orderIndex === undefined || orderIndex === -1) {
    context.styleOrder.push(id)
  } else {
    context.styleOrder.splice(orderIndex, 0, id)
  }
}
