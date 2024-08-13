import {
  pushCommandObject,
  replaceLastCommand,
} from '@pubstudio/frontend/data-access-command'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  ICommandGroupData,
  IEditStyleMixinData,
  ISetComponentCustomStyleData,
} from '@pubstudio/shared/type-command-data'
import { Css, ISite, IStyleEntry } from '@pubstudio/shared/type-site'
import { Ref } from 'vue'

export const removeEditCommand = (
  editCommands: Ref<ICommandGroupData | undefined>,
  prop: Css | undefined,
): { removeCmd: ICommand | undefined; originalStyle: IStyleEntry | undefined } => {
  const removeIndex = editCommands.value?.commands.findIndex((cmd) => {
    const data = cmd.data as ISetComponentCustomStyleData
    // Remove command if it resulted in `prop` being changed or removed, or in an invalid state
    const isInvalidPosition =
      data.newStyle?.property === Css.Position && data.newStyle?.value === ''
    const isInvalid = data.newStyle?.property === '' && data.newStyle?.value === ''
    return (
      isInvalid ||
      isInvalidPosition ||
      (cmd.type === CommandType.SetMixinEntry &&
        (data.newStyle?.property === prop || data.oldStyle?.property === prop))
    )
  })
  let removeCmd: ICommand<ISetComponentCustomStyleData> | undefined
  if (removeIndex !== undefined && removeIndex !== -1) {
    removeCmd = editCommands.value?.commands.splice(removeIndex, 1)[0] as
      | ICommand<ISetComponentCustomStyleData>
      | undefined
  }
  const originalStyle = removeCmd?.data.oldStyle
    ? { ...removeCmd.data.oldStyle }
    : undefined
  return { removeCmd, originalStyle }
}

export const removeMixinNameCommand = (
  editCommands: Ref<ICommandGroupData | undefined>,
): ICommand<IEditStyleMixinData> | undefined => {
  const removeIndex = editCommands.value?.commands.findIndex(
    (cmd) => cmd.type === CommandType.EditStyleMixin,
  )
  if (removeIndex !== undefined && removeIndex !== -1) {
    const removeCmd = editCommands.value?.commands.splice(removeIndex, 1)[0] as
      | ICommand<IEditStyleMixinData>
      | undefined
    return removeCmd
  }
  return undefined
}

export const pushOrReplaceStyleCommand = (
  site: ISite,
  editCommands: Ref<ICommandGroupData | undefined>,
  commands: ICommand[] | undefined,
  firstEdit: boolean,
) => {
  if (commands?.length) {
    editCommands.value?.commands.push(...commands)
  }
  const cmd: ICommand = { type: CommandType.Group, data: editCommands.value }
  if (firstEdit) {
    pushCommandObject(site, cmd)
  } else {
    replaceLastCommand(site, cmd, true)
  }
}
