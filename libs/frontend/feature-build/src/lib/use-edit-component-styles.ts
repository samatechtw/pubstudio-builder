import {
  pushCommandObject,
  replaceLastCommand,
  undoCommand,
} from '@pubstudio/frontend/feature-command'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import {
  editCommands,
  editStyles,
  setStyleType,
  StyleType,
} from '@pubstudio/frontend/util-build'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  ICommandGroupData,
  ISetComponentCustomStyleData,
} from '@pubstudio/shared/type-command-data'
import {
  Css,
  IInheritedStyleEntry,
  IStyleEntry,
  StyleSourceType,
} from '@pubstudio/shared/type-site'
import { useI18n } from 'petite-vue-i18n'
import { computed, ComputedRef, Ref } from 'vue'
import {
  removeComponentCustomStyleCommand,
  setComponentCustomStyleCommand,
  setPositionAbsoluteCommands,
} from './build-command-helpers'
import { useBuild } from './use-build'

export interface IUseEditComponenStylesOptions {
  styleType?: StyleType
}

export interface IUseEditComponentStyles {
  styleEntries: ComputedRef<IInheritedStyleEntry[]>
  editCommands: Ref<ICommandGroupData | undefined>
  editStyles: Ref<Set<string>>
  editStyle: (prop: Css) => void
  cancelEdit: (prop: Css) => void
  setProperty: (oldEntry: IStyleEntry, newProp: Css) => void
  setValue: (oldEntry: IStyleEntry, newValue: string) => void
  saveStyle: (prop: Css) => void
  removeStyle: (style: IStyleEntry) => void
  addComponentStyle: () => void
  getInheritedFrom: (entry: IInheritedStyleEntry) => string | undefined
}

export const useEditComponentStyles = (
  options?: IUseEditComponenStylesOptions,
): IUseEditComponentStyles => {
  const styleType = options?.styleType
  const { t } = useI18n()
  const { site, currentPseudoClass, selectedComponentFlattenedStyles } = useBuild()

  const styleEntries = computed(() =>
    Object.entries(selectedComponentFlattenedStyles.value).map(
      ([css, source]) =>
        ({
          pseudoClass: currentPseudoClass.value,
          property: css as Css,
          value: source.value,
          sourceType: source.sourceType,
          sourceId: source.sourceId,
          sourceBreakpointId: source.sourceBreakpointId,
        }) as IInheritedStyleEntry,
    ),
  )

  const editStyle = (prop: Css) => {
    setStyleType(styleType)
    editStyles.value.add(prop)
  }

  const cancelEdit = (prop: Css) => {
    editStyles.value.delete(prop)
    checkEditStylesComplete()
  }

  // Finishes the editing session if no styles are active
  const checkEditStylesComplete = () => {
    if (editStyles.value.size === 0) {
      editCommands.value = undefined
    }
  }

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

  const removeEditCommand = (
    prop: Css | undefined,
  ): { removeCmd: ICommand | undefined; originalStyle: IStyleEntry | undefined } => {
    const removeIndex = editCommands.value?.commands.findIndex((cmd) => {
      const data = cmd.data as ISetComponentCustomStyleData
      // Remove command if it resulted in `prop` being changed or removed
      return data.newStyle?.property === prop || data.oldStyle?.property === prop
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

  const setStyle = (
    oldStyle: IStyleEntry | undefined,
    newStyle: IStyleEntry | undefined,
  ) => {
    const firstEdit = !editCommands.value
    editCommands.value = editCommands.value ?? { commands: [] }

    // Remove existing command for the prop, if one exists
    const prop = oldStyle?.property ?? newStyle?.property
    const { removeCmd, originalStyle } = removeEditCommand(prop)

    let commands: ICommand[] | undefined
    if (newStyle?.property === Css.Position && newStyle.value === 'absolute') {
      // Makes sure the parent has `relative` or `absolute` style.
      // Otherwise the component might jump to an unexpected location
      commands = setPositionAbsoluteCommands(site.value, oldStyle, { ...newStyle })
    } else if (removeCmd && newStyle && oldStyle?.property !== newStyle?.property) {
      // Undo the previous command to clean up the old property
      undoCommand(site.value, removeCmd)
      // The property changed, and we're replacing a command in the current group
      const c = setComponentCustomStyleCommand(site.value, originalStyle, { ...newStyle })
      if (c) {
        commands = [c]
      }
    } else if (newStyle) {
      const c = setComponentCustomStyleCommand(site.value, oldStyle, { ...newStyle })
      if (c) {
        commands = [c]
      }
    } else if (oldStyle) {
      const c = removeComponentCustomStyleCommand(site.value, originalStyle ?? oldStyle)
      if (c) {
        commands = [c]
      }
    }
    if (commands?.length) {
      editCommands.value.commands.push(...commands)
    }
    const cmd: ICommand = { type: CommandType.Group, data: editCommands.value }
    if (firstEdit) {
      pushCommandObject(cmd)
    } else {
      replaceLastCommand(cmd)
    }
  }

  const addComponentStyle = () => {
    setStyleType(styleType)
    const property = '' as Css
    editStyle(property)
    setStyle(undefined, { pseudoClass: currentPseudoClass.value, property, value: '' })
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

  const getInheritedFrom = (entry: IInheritedStyleEntry): string | undefined => {
    if (entry.sourceType === StyleSourceType.Custom) {
      if (entry.sourceBreakpointId !== activeBreakpoint.value.id) {
        return t('style.inherited_breakpoint', {
          breakpoint: site.value.context.breakpoints[entry.sourceBreakpointId]?.name,
        })
      } else {
        return undefined
      }
    } else if (entry.sourceType === StyleSourceType.Mixin) {
      return t('style.inherited_mixin', {
        mixin: site.value.context.styles[entry.sourceId]?.name,
      })
    } else if (entry.sourceType === StyleSourceType.Is) {
      const sourceName = site.value.context.components[entry.sourceId]?.name
      return t('style.inherited_source', {
        source: `${sourceName}#${entry.sourceId}`,
      })
    } else {
      return 'UNKNOWN_STYLE_SOURCE'
    }
  }

  return {
    styleEntries,
    editCommands,
    editStyles,
    editStyle,
    cancelEdit,
    setProperty,
    setValue,
    addComponentStyle,
    saveStyle,
    removeStyle,
    getInheritedFrom,
  }
}
