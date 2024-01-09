import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { editCommands, undoCommand } from '@pubstudio/frontend/util-command'
import { ICommand, StyleType } from '@pubstudio/shared/type-command'
import {
  Css,
  IInheritedStyleEntry,
  IRawStyleWithSource,
  IStyleEntry,
  StyleSourceType,
} from '@pubstudio/shared/type-site'
import { useI18n } from 'petite-vue-i18n'
import { computed } from 'vue'
import {
  removeComponentCustomStyleCommand,
  setComponentCustomStyleCommand,
  setPositionAbsoluteCommands,
} from '../build-command-helpers'
import { useBuild } from '../use-build'
import { pushOrReplaceStyleCommand, removeEditCommand } from './set-style-helpers'
import { IUseEditStyles, useEditStyles } from './use-edit-styles'

export const useEditComponentStyles = (): IUseEditStyles => {
  const { t } = useI18n()
  const { site, currentPseudoClass, selectedComponentFlattenedStyles } = useBuild()

  const styleEntries = computed(() =>
    Object.entries(selectedComponentFlattenedStyles.value)
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
      ),
  )

  const setStyle = (
    oldStyle: IStyleEntry | undefined,
    newStyle: IStyleEntry | undefined,
  ) => {
    const firstEdit = !editCommands.value
    editCommands.value = editCommands.value ?? { commands: [] }

    // Remove existing command for the prop, if one exists
    const prop = oldStyle?.property ?? newStyle?.property
    const { removeCmd, originalStyle } = removeEditCommand(editCommands, prop)

    let commands: ICommand[] | undefined
    if (newStyle?.property === Css.Position && newStyle.value === 'absolute') {
      // Makes sure the parent has `relative` or `absolute` style.
      // Otherwise the component might jump to an unexpected location
      commands = setPositionAbsoluteCommands(site.value, oldStyle, { ...newStyle })
    } else if (removeCmd && newStyle) {
      // Undo the previous command to clean up the old property/value
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
    pushOrReplaceStyleCommand(site.value, editCommands, commands, firstEdit)
  }

  const getInheritedFrom = (entry: IRawStyleWithSource): string | undefined => {
    if (entry.sourceType === StyleSourceType.Custom) {
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

  return useEditStyles({
    styleType: StyleType.ComponentCustom,
    styleEntries,
    getInheritedFrom,
    setStyle,
  })
}
