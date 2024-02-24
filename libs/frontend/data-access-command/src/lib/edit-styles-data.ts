import { CommandType, ICommand, StyleType } from '@pubstudio/shared/type-command'
import {
  ICommandGroupData,
  ISetComponentCustomStyleData,
} from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { ref } from 'vue'
import { pushCommandObject, undoLastCommand } from './command'
import { setEditingMixinData } from './editor-helpers'

// Names of editing style properties
export const editStyles = ref(new Set<string>())
// Command group for actively editing styles
export const editCommands = ref<ICommandGroupData | undefined>()
export const currentStyleType = ref<StyleType>()

export const editingCommandCount = () => {
  return editCommands.value?.commands.length ?? 0
}

const clearBlankCommands = (site: ISite) => {
  // Clear any blank commands (no property or value set)
  if (editCommands.value) {
    const cmdCount = editingCommandCount()
    if (cmdCount !== 0) {
      editCommands.value.commands = editCommands.value.commands.filter((cmd) => {
        const newStyle = (cmd.data as ISetComponentCustomStyleData).newStyle
        return !(newStyle && newStyle.property === '' && newStyle.value === '')
      })
      if (cmdCount !== editingCommandCount()) {
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
}

const cancelEdit = (site: ISite) => {
  editStyles.value.clear()
  editCommands.value = undefined
  setEditingMixinData(site.editor, undefined)
  currentStyleType.value = undefined
}

export const editStylesCancelEdit = (site: ISite) => {
  clearBlankCommands(site)
  cancelEdit(site)
}

export const setStyleType = (site: ISite, styleType: StyleType | undefined) => {
  // Only one type of style can be edited
  if (currentStyleType.value !== styleType) {
    editStylesCancelEdit(site)
    currentStyleType.value = styleType
  }
}

export const setEditingMixin = (
  site: ISite,
  mixinId: string,
  originComponentId: string | undefined,
) => {
  setStyleType(site, StyleType.Mixin)
  setEditingMixinData(site.editor, {
    mixinId,
    originComponentId,
  })
}
