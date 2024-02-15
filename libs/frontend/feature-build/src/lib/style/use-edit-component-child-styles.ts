import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { editCommands, undoCommand } from '@pubstudio/frontend/util-command'
import {
  computeComponentFlattenedStyles,
  computeComponentOverrideStyle,
} from '@pubstudio/frontend/util-component'
import { ICommand, StyleType } from '@pubstudio/shared/type-command'
import {
  Css,
  IComponent,
  IInheritedStyleEntry,
  IRawStylesWithSource,
  IRawStyleWithSource,
  IStyleEntry,
} from '@pubstudio/shared/type-site'
import { useI18n } from 'petite-vue-i18n'
import { computed, ComputedRef, Ref, ref, watch } from 'vue'
import {
  removeComponentOverrideStyleEntryCommand,
  setOverrideStyleCommand,
} from '../build-command-helpers'
import { useBuild } from '../use-build'
import { pushOrReplaceStyleCommand, removeEditCommand } from './set-style-helpers'
import { IUseEditStyles, useEditStyles } from './use-edit-styles'

export interface IUseEditComponentChildStyles extends IUseEditStyles {
  selector: Ref<string | undefined>
  selectors: ComputedRef<string[]>
  flattenedChildStyles: ComputedRef<IRawStylesWithSource>
  hasMissingSelector: ComputedRef<boolean>
  isMissingSelector: (childId: string) => boolean
}

export interface IUseEditComponentChildStyleOptions {
  component: Ref<IComponent>
}

export const useEditComponentChildStyles = (
  options: IUseEditComponentChildStyleOptions,
): IUseEditComponentChildStyles => {
  const { component } = options
  const { t } = useI18n()
  const { site, editor, currentPseudoClass } = useBuild()

  const getDefaultSelector = (): string | undefined => {
    return Object.keys(component.value.style.overrides ?? {})[0]
  }

  const selector = ref(getDefaultSelector())

  const flattenedChildStyles = computed(() => {
    const { selectedComponent } = site.value.editor ?? {}
    if (selectedComponent && selector.value) {
      const breakpointStyles = computeComponentOverrideStyle(
        selectedComponent,
        selector.value,
      )
      return computeComponentFlattenedStyles(
        editor.value,
        breakpointStyles,
        descSortedBreakpoints.value,
        activeBreakpoint.value,
        true,
      )
    }
    return {}
  })

  const styleEntries = computed<IInheritedStyleEntry[]>(() => {
    return Object.entries(flattenedChildStyles.value)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([css, source]) => {
        const inheritedFrom = getInheritedFrom(source)
        return {
          pseudoClass: currentPseudoClass.value,
          property: css as Css,
          value: source.value,
          sourceType: source.sourceType,
          sourceId: source.sourceId,
          sourceBreakpointId: source.sourceBreakpointId,
          inheritedFrom,
          inherited: !!inheritedFrom,
        } as IInheritedStyleEntry
      })
  })

  const childrenIdSet = computed(
    () => new Set(component.value.children?.map((child) => child.id)),
  )

  const overriddenChildrenIdSet = computed(
    () => new Set(Object.keys(component.value.style.overrides ?? {})),
  )

  const selectors = computed(() => {
    const allIds = [...childrenIdSet.value, ...overriddenChildrenIdSet.value]
    const uniqueIds = new Set(allIds)
    return Array.from(uniqueIds)
  })

  const hasMissingSelector = computed(() => {
    const overriddenChildrenIds = Array.from(overriddenChildrenIdSet.value)
    return overriddenChildrenIds.some((id) => !childrenIdSet.value.has(id))
  })

  const isMissingSelector = (childId: string) => {
    return !childrenIdSet.value.has(childId)
  }

  const setStyle = (
    oldStyle: IStyleEntry | undefined,
    newStyle: IStyleEntry | undefined,
  ) => {
    if (selector.value === undefined) {
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
      const c = setOverrideStyleCommand(site.value, selector.value, originalStyle, {
        ...newStyle,
      })
      if (c) {
        commands = [c]
      }
    } else if (newStyle) {
      const c = setOverrideStyleCommand(site.value, selector.value, oldStyle, {
        ...newStyle,
      })
      if (c) {
        commands = [c]
      }
    } else if (oldStyle) {
      const c = removeComponentOverrideStyleEntryCommand(
        site.value,
        selector.value,
        originalStyle ?? oldStyle,
      )
      if (c) {
        commands = [c]
      }
    }
    pushOrReplaceStyleCommand(site.value, editCommands, commands, firstEdit)
  }

  const getInheritedFrom = (entry: IRawStyleWithSource) => {
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

  watch(selectors, (newSelectors) => {
    // Ensure that the current selector doesn't retain a deleted/non-existent value after selecting
    // another component, or after redoing an override style removal for a specific selector.
    if (!selector.value || (selector.value && !newSelectors.includes(selector.value))) {
      selector.value = getDefaultSelector()
    }
  })

  const editStyles = useEditStyles({
    styleType: StyleType.ComponentChild,
    styleEntries,
    getInheritedFrom,
    setStyle,
  })
  return {
    ...editStyles,
    flattenedChildStyles,
    selector,
    selectors,
    hasMissingSelector,
    isMissingSelector,
  }
}
