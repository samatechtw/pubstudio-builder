import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import {
  currentStyleType,
  editCommands,
  editingMixinData,
  editStyles,
  editStylesCancelEdit,
  setEditingMixin,
  undoCommand,
} from '@pubstudio/frontend/util-command'
import { computeComponentFlattenedStyles } from '@pubstudio/frontend/util-component'
import { styleId } from '@pubstudio/frontend/util-ids'
import { ICommand, StyleType } from '@pubstudio/shared/type-command'
import { ICloseMixinMenuData } from '@pubstudio/shared/type-command-data'
import {
  Css,
  CssPseudoClass,
  IBreakpointStyles,
  IBreakpointStylesWithSource,
  IComponent,
  IInheritedStyleEntry,
  IRawStylesWithSource,
  IRawStyleWithSource,
  IStyle,
  IStyleEntry,
  StyleSourceType,
} from '@pubstudio/shared/type-site'
import { useI18n } from 'petite-vue-i18n'
import { computed, ComputedRef, Ref, ref, watch } from 'vue'
import { editMixinEntryCommand, editStyleNameCommand } from '../build-command-helpers'
import { useBuild } from '../use-build'
import { pushOrReplaceStyleCommand, removeEditCommand } from './set-style-helpers'
import { IUseEditStyles, useEditStyles } from './use-edit-styles'

export interface IUseStyleMenuFeature extends IUseEditStyles {
  isEditingMixin: ComputedRef<boolean>
  editingMixinData: Ref<ICloseMixinMenuData | undefined>
  editingStyle: ComputedRef<IStyle | undefined>
  styleError: Ref<string | undefined>
  editingName: Ref<string>
  newStyle: (source?: IComponent) => void
  saveMixinName: () => void
}

export interface IEditingStyle extends Omit<IStyle, 'id'> {
  id?: string
  sourceComponentId?: string
}

const { site } = useSiteSource()

const styleError = ref<string | undefined>()
export const editingName = ref('')

const editingStyle = computed<IStyle | undefined>(() => {
  if (editingMixinData.value) {
    return site.value.context.styles[editingMixinData.value.id]
  }
  return undefined
})

watch(editingStyle, (style) => {
  if (style) {
    editingName.value = style.name
  } else {
    editingName.value = ''
  }
})

export const useReusableStyleMenu = (): IUseStyleMenuFeature => {
  const { t } = useI18n()
  const { site, editor, currentPseudoClass, addStyle, convertComponentStyle } = useBuild()

  const newStyle = (source?: IComponent) => {
    let mixinId: string | undefined
    if (source) {
      const name = `${source.name}_Style`
      mixinId = convertComponentStyle(
        source.id,
        name,
        JSON.parse(JSON.stringify(source.style.custom)),
      )
    } else {
      const id = styleId(
        site.value.context.namespace,
        site.value.context.nextId.toString(),
      )
      const name = `Style_${id}`
      const breakpoints: IBreakpointStyles = { default: {} }
      addStyle(name, breakpoints)
      mixinId = id
    }
    if (mixinId) {
      setEditingMixin(site.value, mixinId, source?.id)
    }
  }

  const styleEntries = computed(() => {
    // Compute breakpoint styles with source
    const breakpointStylesWithSource: IBreakpointStylesWithSource = {}
    Object.entries(editingStyle.value?.breakpoints ?? {}).forEach(
      ([breakpointId, editingPseudoStyle]) => {
        if (!breakpointStylesWithSource[breakpointId]) {
          breakpointStylesWithSource[breakpointId] = {}
        }
        const pseudoStyle = breakpointStylesWithSource[breakpointId]

        Object.entries(editingPseudoStyle).forEach(([pseudoClass, editingRawStyle]) => {
          if (!pseudoStyle[pseudoClass as CssPseudoClass]) {
            pseudoStyle[pseudoClass as CssPseudoClass] = {}
          }
          const rawStyle = pseudoStyle[
            pseudoClass as CssPseudoClass
          ] as IRawStylesWithSource

          Object.entries(editingRawStyle).forEach(([css, value]) => {
            rawStyle[css as Css] = {
              sourceType: StyleSourceType.Mixin,
              sourceId: editingStyle.value?.id ?? '',
              sourceBreakpointId: breakpointId,
              value,
            }
          })
        })
      },
    )

    const flattenedStyles = computeComponentFlattenedStyles(
      editor.value,
      breakpointStylesWithSource,
      descSortedBreakpoints.value,
      activeBreakpoint.value,
      true,
    )

    return Object.entries(flattenedStyles)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(
        ([css, source]) =>
          ({
            pseudoClass: currentPseudoClass.value,
            property: css as Css,
            value: source.value,
            sourceType: source.sourceType,
            sourceId: source.sourceId,
            sourceBreakpointId: source.sourceBreakpointId,
            inheritedFrom: getInheritedFrom(source),
          }) as IInheritedStyleEntry,
      )
  })

  const getInheritedFrom = (entry: IRawStyleWithSource): string | undefined => {
    if (entry.sourceBreakpointId !== activeBreakpoint.value.id) {
      return t('style.inherited_breakpoint', {
        breakpoint: site.value.context.breakpoints[entry.sourceBreakpointId]?.name,
      })
    } else if (
      entry.sourcePseudoClass !== undefined &&
      entry.sourcePseudoClass !== currentPseudoClass.value
    ) {
      return t('style.inherited_pseudo_class', {
        pseudoClass: entry.sourcePseudoClass,
      })
    } else {
      return undefined
    }
  }

  const validateStyle = (): boolean => {
    styleError.value = undefined
    if (!editingStyle.value?.name) {
      styleError.value = 'Style must have a name'
    }
    return !styleError.value
  }

  const saveMixinName = () => {
    const styleId = editingMixinData.value?.id
    if (!styleId || !validateStyle()) {
      return
    }
    // Add the edit name command to the edit commands, if the name changed
    if (editingName.value !== editingStyle.value?.name) {
      const command = editStyleNameCommand(site.value, styleId, editingName.value)
      if (command) {
        const firstEdit = !editCommands.value
        editCommands.value = editCommands.value ?? { commands: [] }
        pushOrReplaceStyleCommand(site.value, editCommands, [command], firstEdit)
      }
    }
    editStylesCancelEdit(site.value)
  }

  const isEditingMixin = computed(() => {
    return !!editingMixinData.value
  })

  const setStyle = (
    oldStyle: IStyleEntry | undefined,
    newStyle: IStyleEntry | undefined,
  ) => {
    if (!editingMixinData.value) {
      return
    }
    const firstEdit = !editCommands.value
    editCommands.value = editCommands.value ?? { commands: [] }

    // Remove existing command for the prop, if one exists
    const prop = oldStyle?.property ?? newStyle?.property
    const { removeCmd, originalStyle } = removeEditCommand(editCommands, prop)

    let commands: ICommand[] | undefined
    if (removeCmd && newStyle) {
      // Undo the previous command to clean up the old property/value
      undoCommand(site.value, removeCmd)
      // The property changed, and we're replacing a command in the current group
      const c = editMixinEntryCommand(editingMixinData.value.id, originalStyle, {
        ...newStyle,
      })
      if (c) {
        commands = [c]
      }
    } else if (newStyle) {
      const c = editMixinEntryCommand(editingMixinData.value.id, oldStyle, {
        ...newStyle,
      })
      if (c) {
        commands = [c]
      }
    } else if (oldStyle) {
      const c = editMixinEntryCommand(
        editingMixinData.value.id,
        originalStyle ?? oldStyle,
        undefined,
      )
      if (c) {
        commands = [c]
      }
    }
    pushOrReplaceStyleCommand(site.value, editCommands, commands, firstEdit)
  }

  // Override saveStyle and deleteStyle
  // We don't want to close the reusable styles menu after saving a style.
  const saveStyle = (prop: Css) => {
    editStyles.value.delete(prop)
  }

  const removeStyle = (style: IStyleEntry) => {
    setStyle(style, undefined)
    editStyles.value.delete(style.property)
  }

  const editStylesUsable = useEditStyles({
    styleType: StyleType.Mixin,
    styleEntries,
    getInheritedFrom,
    setStyle,
  })
  return {
    ...editStylesUsable,
    editingMixinData,
    editingStyle,
    isEditingMixin,
    styleError,
    editingName,
    saveStyle,
    removeStyle,
    newStyle,
    saveMixinName,
  }
}
