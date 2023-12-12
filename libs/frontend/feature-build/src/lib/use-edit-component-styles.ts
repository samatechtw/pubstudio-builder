import {
  pushCommandObject,
  replaceLastCommand,
} from '@pubstudio/frontend/feature-command'
import {
  clearComponentEditStyle,
  setComponentEditStyle,
  setComponentMenuCollapses,
} from '@pubstudio/frontend/feature-editor'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  ICommandGroupData,
  ISetComponentCustomStyleData,
} from '@pubstudio/shared/type-command-data'
import {
  ComponentMenuCollapsible,
  Css,
  IInheritedStyleEntry,
  IStyleEntry,
  StyleSourceType,
} from '@pubstudio/shared/type-site'
import { useI18n } from 'petite-vue-i18n'
import { computed, ComputedRef, Ref, ref } from 'vue'
import {
  removeComponentCustomStyleCommand,
  setComponentCustomStyleCommand,
  setPositionAbsoluteCommands,
} from './build-command-helpers'
import { useBuild } from './use-build'

export interface IUseEditComponentStyles {
  styleEntries: ComputedRef<IInheritedStyleEntry[]>
  editCommands: Ref<ICommandGroupData | undefined>
  editStyle: (prop: Css) => void
  setProperty: (oldEntry: IStyleEntry, newProp: Css) => void
  setValue: (oldEntry: IStyleEntry, newValue: string) => void
  saveStyle: (prop: Css) => void
  removeStyle: (style: IStyleEntry) => void
  addComponentStyle: () => void
  getInheritedFrom: (entry: IInheritedStyleEntry) => string | undefined
}

export const useEditComponentStyles = (): IUseEditComponentStyles => {
  const { t } = useI18n()
  const { site, editor, currentPseudoClass, selectedComponentFlattenedStyles } =
    useBuild()

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

  const editCommands = ref<ICommandGroupData | undefined>()

  const editStyle = (prop: Css) => {
    setComponentEditStyle(site.value.editor, prop)
  }

  // Finishes the editing session if no styles are active
  const checkEditStylesComplete = () => {
    if (editor.value?.editStyles.size === 0) {
      editCommands.value = undefined
    }
  }

  const setProperty = (oldEntry: IStyleEntry, newProp: Css) => {
    const { pseudoClass, value } = oldEntry
    clearComponentEditStyle(site.value.editor, oldEntry.property)
    setStyle(
      { pseudoClass, property: oldEntry.property, value },
      { pseudoClass, property: newProp, value },
    )
    setComponentEditStyle(site.value.editor, newProp)
    console.log(JSON.stringify(editCommands.value, null, 2))
  }

  const setValue = (oldEntry: IStyleEntry, newValue: string) => {
    const { pseudoClass, value, property } = oldEntry
    setStyle({ pseudoClass, property, value }, { pseudoClass, property, value: newValue })
  }

  const setStyle = (
    oldStyle: IStyleEntry | undefined,
    newStyle: IStyleEntry | undefined,
  ) => {
    const firstEdit = !editCommands.value
    editCommands.value = editCommands.value ?? { commands: [] }

    // Remove existing command for the prop, if one exists
    const prop = newStyle?.property ?? oldStyle?.property
    editCommands.value.commands = editCommands.value.commands.filter((cmd) => {
      const data = cmd.data as ISetComponentCustomStyleData
      // Filter command if it resulted in `prop` being changed or removed
      if (data.newStyle?.property === prop || data.oldStyle?.property === prop) {
        return false
      }
      return true
    })

    let commands: ICommand[] | undefined
    if (newStyle?.property === Css.Position && newStyle.value === 'absolute') {
      // Makes sure the parent has `relative` or `absolute` style.
      // Otherwise the component might jump to an unexpected location
      commands = setPositionAbsoluteCommands(site.value, oldStyle, { ...newStyle })
    } else if (newStyle) {
      const c = setComponentCustomStyleCommand(site.value, oldStyle, { ...newStyle })
      if (c) {
        commands = [c]
      }
    } else if (oldStyle) {
      const c = removeComponentCustomStyleCommand(site.value, oldStyle)
      console.log('REMOVE', oldStyle, c)
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
    setComponentMenuCollapses(editor.value, ComponentMenuCollapsible.Styles, false)
    const property = '' as Css
    editStyle(property)
    setStyle(undefined, { pseudoClass: currentPseudoClass.value, property, value: '' })
    console.log(JSON.stringify(editCommands.value, null, 2))
  }

  const saveStyle = (prop: Css) => {
    clearComponentEditStyle(editor.value, prop)
  }

  const removeStyle = (style: IStyleEntry) => {
    setStyle(style, undefined)
    clearComponentEditStyle(editor.value, style.property)
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
    editStyle,
    setProperty,
    setValue,
    addComponentStyle,
    saveStyle,
    removeStyle,
    getInheritedFrom,
  }
}
