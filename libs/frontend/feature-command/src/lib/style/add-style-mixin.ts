import { resolveStyle } from '@pubstudio/frontend/util-builtin'
import { latestStyleId, nextStyleId } from '@pubstudio/frontend/util-ids'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IAddStyleMixinData } from '@pubstudio/shared/type-command-data'
import { ISite, IStyle } from '@pubstudio/shared/type-site'

export interface AddStyle extends ICommand<IAddStyleMixinData> {
  type: CommandType.AddStyleMixin
}

export const applyAddStyleMixin = (site: ISite, data: IAddStyleMixinData) => {
  const context = site.context
  const { id: builtinId, name, breakpoints } = data
  const styleId = builtinId ?? nextStyleId(context)
  const newStyle: IStyle = {
    id: styleId,
    name: name ?? styleId,
    breakpoints,
  }
  context.styles[styleId] = newStyle
}

export const undoAddStyleMixin = (site: ISite, data: IAddStyleMixinData) => {
  const context = site.context
  const { id: builtinId } = data
  const styleId = builtinId ?? latestStyleId(context)
  const style = resolveStyle(context, styleId)
  if (style) {
    delete context.styles[styleId]
    // Don't restore nextId if the style was copied from a builtin
    if (!builtinId) {
      context.nextId -= 1
    }
    // TODO -- should we delete all references here?
  }
}
