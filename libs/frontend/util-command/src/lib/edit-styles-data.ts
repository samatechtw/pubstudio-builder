import { CommandType, ICommand, StyleType } from '@pubstudio/shared/type-command'
import {
  ICloseMixinMenuData,
  ICommandGroupData,
  ISetComponentCustomStyleData,
} from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { ref } from 'vue'
import { getLastCommand, pushCommandObject, undoLastCommand } from './command'
import { replaceLastCommand } from './replace-last-command'

// Names of editing style properties
export const editStyles = ref(new Set<string>())
// Command group for actively editing styles
export const editCommands = ref<ICommandGroupData | undefined>()
export const currentStyleType = ref<StyleType>()

// Extra info for editing reusable styles/mixins
export const editingMixinData = ref<ICloseMixinMenuData | undefined>()

const clearBlankCommands = (site: ISite) => {
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
}

const cancelEdit = () => {
  editStyles.value.clear()
  editCommands.value = undefined
  editingMixinData.value = undefined
}

export const editStylesCancelEdit = (site: ISite) => {
  clearBlankCommands(site)
  if (currentStyleType.value === StyleType.Mixin && editingMixinData.value) {
    const closeCommand: ICommand<ICloseMixinMenuData> = {
      type: CommandType.CloseMixinMenu,
      data: editingMixinData.value,
    }

    if (getLastCommand(site)?.type === CommandType.CloseMixinMenu) {
      replaceLastCommand(site, closeCommand)
    } else {
      pushCommandObject(site, closeCommand)
    }
  }
  cancelEdit()
}

// Used by close-mixin-menu command to avoid recursively calling editStylesCancelEdit
export const closeMixinMenu = (site: ISite) => {
  clearBlankCommands(site)
  cancelEdit()
  currentStyleType.value = undefined
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
  editingMixinData.value = {
    id: mixinId,
    componentId: originComponentId,
  }
}
