import {
  currentStyleType,
  editCommands,
  editStyles,
  editStylesCancelEdit,
  setStyleType,
} from '@pubstudio/frontend/util-command'
import { StyleType } from '@pubstudio/shared/type-command'
import { ICommandGroupData } from '@pubstudio/shared/type-command-data'
import {
  Css,
  IInheritedStyleEntry,
  IRawStyleWithSource,
  IStyleEntryWithInherited,
} from '@pubstudio/shared/type-site'
import { computed, ComputedRef, Ref } from 'vue'
import { useBuild } from '../use-build'

// Interface for composable that provides data and methods for updating styles
// Implemented for component styles, child override styles, and reusable styles
export interface IUseEditStylesOptions {
  styleType?: StyleType
  styleEntries: ComputedRef<IInheritedStyleEntry[]>
  getInheritedFrom: (entry: IRawStyleWithSource) => string | undefined
  setStyle: (
    oldStyle: IStyleEntryWithInherited | undefined,
    newStyle: IStyleEntryWithInherited | undefined,
  ) => void
}

export interface IUseEditStyles extends Omit<IUseEditStylesOptions, 'setStyle'> {
  editCommands: Ref<ICommandGroupData | undefined>
  editStyles: Ref<Set<string>>
  nonInheritedProperties: ComputedRef<string[]>
  setProperty: (oldEntry: IStyleEntryWithInherited, newProp: Css) => void
  setValue: (oldEntry: IStyleEntryWithInherited, newValue: string) => void
  editStyle: (prop: Css) => void
  cancelEdit: (prop: Css) => void
  saveStyle: (prop: Css) => void
  removeStyle: (style: IStyleEntryWithInherited) => void
  createStyle: () => void
  isEditing: (propName: string) => boolean
}

export const useEditStyles = (options: IUseEditStylesOptions): IUseEditStyles => {
  const { styleType, styleEntries, getInheritedFrom, setStyle } = options
  const { site, currentPseudoClass } = useBuild()

  const nonInheritedProperties = computed(() =>
    styleEntries.value
      .filter((style) => !style.inheritedFrom)
      .map((style) => style.property),
  )

  const setProperty = (oldEntry: IStyleEntryWithInherited, newProp: Css) => {
    const { pseudoClass, value } = oldEntry
    editStyles.value.delete(oldEntry.property)
    setStyle(
      {
        pseudoClass,
        property: oldEntry.property,
        value,
        inherited: oldEntry.inherited,
      },
      { pseudoClass, property: newProp, value, inherited: false },
    )
    editStyles.value.add(newProp)
  }

  const setValue = (oldEntry: IStyleEntryWithInherited, newValue: string) => {
    const { pseudoClass, value, property, inherited } = oldEntry
    setStyle(
      { pseudoClass, property, value, inherited },
      { pseudoClass, property, value: newValue, inherited: false },
    )
  }

  const editStyle = (prop: Css) => {
    setStyleType(site.value, styleType)
    editStyles.value.add(prop)
  }

  const cancelEdit = (prop: Css) => {
    editStyles.value.delete(prop)
    checkEditStylesComplete()
  }

  // Finishes the editing session if no styles are active
  const checkEditStylesComplete = () => {
    editCommands.value = undefined
    if (editStyles.value.size === 0) {
      editStylesCancelEdit(site.value)
    }
  }

  const createStyle = () => {
    setStyleType(site.value, styleType)
    const property = '' as Css
    editStyle(property)
    setStyle(undefined, {
      pseudoClass: currentPseudoClass.value,
      property,
      value: '',
      inherited: false,
    })
  }

  const saveStyle = (prop: Css) => {
    editStyles.value.delete(prop)
    checkEditStylesComplete()
  }

  const removeStyle = (style: IStyleEntryWithInherited) => {
    setStyle(style, undefined)
    editStyles.value.delete(style.property)
    checkEditStylesComplete()
  }

  const isEditing = (propName: string) => {
    return styleType === currentStyleType.value && editStyles.value?.has(propName)
  }

  return {
    editCommands,
    editStyles,
    styleType,
    styleEntries,
    nonInheritedProperties,
    setProperty,
    setValue,
    editStyle,
    cancelEdit,
    getInheritedFrom,
    createStyle,
    saveStyle,
    removeStyle,
    isEditing,
  }
}
