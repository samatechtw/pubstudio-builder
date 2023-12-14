import { ICommandGroupData } from '@pubstudio/shared/type-command-data'
import { ref } from 'vue'

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

export const componentStylesCancelEdit = () => {
  editStyles.value.clear()
  editCommands.value = undefined
}

export const setStyleType = (styleType: StyleType | undefined) => {
  // Only one type of style can be edited
  if (currentStyleType.value !== styleType) {
    componentStylesCancelEdit()
    currentStyleType.value = styleType
  }
}
