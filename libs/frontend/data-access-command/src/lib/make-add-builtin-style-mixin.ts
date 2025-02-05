import { builtinStyles } from '@pubstudio/frontend/util-builtin'
import { resolveStyle } from '@pubstudio/frontend/util-resolve'
import { CommandType } from '@pubstudio/shared/type-command'
import { IAddStyleMixinData } from '@pubstudio/shared/type-command-data'
import { ISiteContext } from '@pubstudio/shared/type-site'
import { AddStyle } from './style/add-style-mixin'

export const makeAddBuiltinStyleMixin = (
  context: ISiteContext,
  builtinStyleId: string,
): AddStyle | undefined => {
  const builtinStyle = builtinStyles[builtinStyleId]
  const alreadyExists = resolveStyle(context, builtinStyleId)
  if (builtinStyle && !alreadyExists) {
    const addMixinData: IAddStyleMixinData = structuredClone(builtinStyle)
    addMixinData.isBuiltin = true
    return { type: CommandType.AddStyleMixin, data: addMixinData }
  }
  return undefined
}
