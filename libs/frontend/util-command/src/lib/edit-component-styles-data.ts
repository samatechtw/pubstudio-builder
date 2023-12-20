import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  ICommandGroupData,
  ISetComponentCustomStyleData,
} from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { ref } from 'vue'
import { pushCommandObject, undoLastCommand } from './command'

export enum StyleType {
  ComponentCustom = 'componentCustom',
  ComponentChild = 'componentChild',
  Mixin = 'mixin',
}

// Names of editing style properties
export const editStyles = ref(new Set<string>())
// Command group for actively editing styles
export const editCommands = ref<ICommandGroupData | undefined>()
export const currentStyleType = ref<StyleType>()

export const componentStylesCancelEdit = (site: ISite) => {
  // Clear any blank commands (no property or value set)
  if (editCommands.value) {
    const cmdCount = editCommands.value.commands.length
    if (cmdCount !== 0) {
      editCommands.value.commands = editCommands.value.commands.filter((cmd) => {
        const newStyle = (cmd.data as ISetComponentCustomStyleData).newStyle
        return !(newStyle && newStyle.property === '' && newStyle.value === '')
      })
      if (cmdCount !== editCommands.value.commands.length) {
        const cmd: ICommand = { type: CommandType.Group, data: editCommands.value }
        // Remember the current selected component, in case this was called from setSelectedComponent
        // In that case, the component selected by the user should remain selected
        const selectedCmp = site.editor?.selectedComponent
        undoLastCommand(site)
        pushCommandObject(site, cmd)
        if (site.editor) {
          site.editor.selectedComponent = selectedCmp
        }
      }
    }
  }
  editStyles.value.clear()
  editCommands.value = undefined
}

export const setStyleType = (site: ISite, styleType: StyleType | undefined) => {
  // Only one type of style can be edited
  if (currentStyleType.value !== styleType) {
    componentStylesCancelEdit(site)
    currentStyleType.value = styleType
  }
}
