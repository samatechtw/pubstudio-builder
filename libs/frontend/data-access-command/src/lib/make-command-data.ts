import { builtinStyles } from '@pubstudio/frontend/util-builtin'
import { resolveStyle } from '@pubstudio/frontend/util-resolve'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  IAddStyleMixinData,
  IUpdateUiData,
  UiAction,
} from '@pubstudio/shared/type-command-data'
import { IEditorContext, ISiteContext } from '@pubstudio/shared/type-site'
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

// `toComponentId` overrides component to show after closing,
//    useful if close action was triggered by selecting a new component
export const makeCloseMixinMenu = (
  editor: IEditorContext | undefined,
  toComponentId?: string,
): ICommand<IUpdateUiData<UiAction.CloseMixinMenu>> | undefined => {
  const editingMixinData = editor?.editingMixinData
  if (editingMixinData) {
    const command: ICommand<IUpdateUiData<UiAction.CloseMixinMenu>> = {
      type: CommandType.UpdateUi,
      data: {
        action: UiAction.CloseMixinMenu,
        params: {
          mixinId: editingMixinData.mixinId as string,
          originComponentId: toComponentId ?? editingMixinData.originComponentId,
        },
      },
    }
    return command
  }
  return undefined
}
