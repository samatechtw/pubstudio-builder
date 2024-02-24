import {
  currentStyleType,
  editCommands,
  editStyles,
  editStylesCancelEdit,
  setStyleType,
} from '@pubstudio/frontend/data-access-command'
import { StyleType } from '@pubstudio/shared/type-command'
import { ICommandGroupData } from '@pubstudio/shared/type-command-data'
import {
  Css,
  IInheritedStyleEntry,
  IRawStyleWithSource,
  IStyleEntry,
} from '@pubstudio/shared/type-site'
import { computed, ComputedRef, Ref } from 'vue'
import { useBuild } from '../use-build'

// Interface for composable that provides data and methods for updating styles
// Implemented for component styles, child override styles, and reusable styles
export interface IUseEditStylesOptions {
  styleType?: StyleType
  styleEntries: ComputedRef<IInheritedStyleEntry[]>
  getInheritedFrom: (entry: IRawStyleWithSource) => string | undefined
  setStyle: (oldStyle: IStyleEntry | undefined, newStyle: IStyleEntry | undefined) => void
}

export interface ICreateStyleOptions {
  prop?: Css
  value?: string
}

export interface IUseEditStyles extends Omit<IUseEditStylesOptions, 'setStyle'> {
  editCommands: Ref<ICommandGroupData | undefined>
  editStyles: Ref<Set<string>>
  nonInheritedProperties: ComputedRef<string[]>
  setProperty: (oldEntry: IStyleEntry, newProp: Css) => void
  setValue: (oldEntry: IStyleEntry, newValue: string) => void
  editStyle: (prop: Css) => void
  cancelEdit: (prop: Css) => void
  saveStyle: (prop: Css) => void
  removeStyle: (style: IStyleEntry) => void
  createStyle: (options?: ICreateStyleOptions) => void
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

  const setProperty = (oldEntry: IStyleEntry, newProp: Css) => {
    const { pseudoClass, value } = oldEntry
    editStyles.value.delete(oldEntry.property)
    setStyle(
      { pseudoClass, property: oldEntry.property, value },
      { pseudoClass, property: newProp, value },
    )
    editStyles.value.add(newProp)
  }

  const setValue = (oldEntry: IStyleEntry, newValue: string) => {
    const { pseudoClass, value, property } = oldEntry
    setStyle({ pseudoClass, property, value }, { pseudoClass, property, value: newValue })
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

  const createStyle = (options?: ICreateStyleOptions) => {
    setStyleType(site.value, styleType)
    const property = (options?.prop ?? '') as Css
    editStyle(property)
    setStyle(undefined, {
      pseudoClass: currentPseudoClass.value,
      property,
      value: options?.value ?? '',
    })
  }

  const saveStyle = (prop: Css) => {
    editStyles.value.delete(prop)
    checkEditStylesComplete()
  }

  const removeStyle = (style: IStyleEntry) => {
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
