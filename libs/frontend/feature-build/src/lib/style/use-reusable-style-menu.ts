import {
  currentStyleType,
  editCommands,
  editStyles,
  setEditingMixin,
  undoCommand,
} from '@pubstudio/frontend/data-access-command'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { computeFlattenedStyles } from '@pubstudio/frontend/util-component'
import { styleId } from '@pubstudio/frontend/util-ids'
import { ICommand, StyleType } from '@pubstudio/shared/type-command'
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
import { computed, ComputedRef, Ref, ref } from 'vue'
import { editMixinEntryCommand, editStyleNameCommand } from '../build-command-helpers'
import { useBuild } from '../use-build'
import {
  pushOrReplaceStyleCommand,
  removeEditCommand,
  removeMixinNameCommand,
} from './set-style-helpers'
import { IUseEditStyles, useEditStyles } from './use-edit-styles'
import { useMixinMenuUi } from './use-mixin-menu-ui'

export interface IUseStyleMenuFeature extends IUseEditStyles {
  isEditingMixin: ComputedRef<boolean>
  editingStyle: ComputedRef<IStyle | undefined>
  styleError: Ref<string | undefined>
  newStyle: (source?: IComponent) => void
  setMixinName: (name: string) => void
  saveMixinStyles: () => void
}

export interface IEditingStyle extends Omit<IStyle, 'id'> {
  id?: string
  sourceComponentId?: string
}

const { site } = useSiteSource()

const styleError = ref<string | undefined>()

const editingStyle = computed<IStyle | undefined>(() => {
  const { editingMixinData } = site.value.editor ?? {}
  if (editingMixinData?.mixinId) {
    return site.value.context.styles[editingMixinData.mixinId]
  }
  return undefined
})

export const useReusableStyleMenu = (): IUseStyleMenuFeature => {
  const { t } = useI18n()
  const { site, editor, currentPseudoClass, addStyle, convertComponentStyle } = useBuild()
  const { closeMixinMenu } = useMixinMenuUi()

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

    const flattenedStyles = computeFlattenedStyles(
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

  const setMixinName = (name: string) => {
    if (!editingStyle.value) {
      return
    }
    const firstEdit = !editCommands.value
    editCommands.value = editCommands.value ?? { commands: [] }
    // Remove edit mixin name command, if it exists
    const removeCmd = removeMixinNameCommand(editCommands)

    const command = editStyleNameCommand(
      editingStyle.value.id,
      removeCmd?.data.oldName ?? editingStyle.value?.name ?? '',
      name,
    )
    if (command) {
      pushOrReplaceStyleCommand(site.value, editCommands, [command], firstEdit)
    }
  }

  const saveMixinStyles = () => {
    const styleId = editingStyle.value?.id
    if (!styleId || !validateStyle()) {
      return
    }
    closeMixinMenu()
  }

  const isEditingMixin = computed(() => {
    return !!editingStyle.value
  })

  const setStyle = (
    oldStyle: IStyleEntry | undefined,
    newStyle: IStyleEntry | undefined,
  ) => {
    if (!editingStyle.value) {
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
      const c = editMixinEntryCommand(editingStyle.value.id, originalStyle, {
        ...newStyle,
      })
      if (c) {
        commands = [c]
      }
    } else if (newStyle) {
      const c = editMixinEntryCommand(editingStyle.value.id, oldStyle, {
        ...newStyle,
      })
      if (c) {
        commands = [c]
      }
    } else if (oldStyle) {
      const c = editMixinEntryCommand(
        editingStyle.value.id,
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

  const editStyle = (prop: Css) => {
    currentStyleType.value = StyleType.Mixin
    editStyles.value.add(prop)
  }

  const removeStyle = (style: IStyleEntry) => {
    setStyle(style, undefined)
    editStyles.value.delete(style.property)
  }

  const createStyle = () => {
    currentStyleType.value = StyleType.Mixin
    const property = '' as Css
    editStyle(property)
    setStyle(undefined, { pseudoClass: currentPseudoClass.value, property, value: '' })
  }

  const editStylesUsable = useEditStyles({
    styleType: StyleType.Mixin,
    styleEntries,
    getInheritedFrom,
    setStyle,
  })
  return {
    ...editStylesUsable,
    editingStyle,
    isEditingMixin,
    styleError,
    saveStyle,
    removeStyle,
    editStyle,
    createStyle,
    newStyle,
    setMixinName,
    saveMixinStyles,
  }
}
