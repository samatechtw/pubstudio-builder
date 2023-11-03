import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { computeComponentFlattenedStyles } from '@pubstudio/frontend/util-component'
import {
  Css,
  CssPseudoClass,
  IBreakpointStylesWithSource,
  IInheritedStyleEntry,
  IRawStylesWithSource,
  IStyle,
  IStyleEntry,
  StyleSourceType,
} from '@pubstudio/shared/type-site'
import { computed, ComputedRef, Ref, ref, toRaw } from 'vue'
import { useBuild } from './use-build'

export interface IUseStyleMenuFeature {
  editing: Ref<boolean>
  editingStyle: Ref<IEditingStyle>
  editingStyleEntries: ComputedRef<IInheritedStyleEntry[]>
  styleError: Ref<string | undefined>
  styles: ComputedRef<IStyle[]>
  clearEditingState: () => void
  newStyle: () => void
  setEditingStyle: (style: IStyle) => void
  newEditingStyleProp: () => void
  updateEditingStyleProp: (oldProperty: Css, newEntry: IStyleEntry) => void
  removeEditingStyleProp: (property: Css) => void
  saveStyle: () => void
}

export interface IEditingStyle extends Omit<IStyle, 'id'> {
  id?: string
}

const emptyStyle = (): IEditingStyle => ({
  id: undefined,
  name: '',
  breakpoints: {},
})

const editing = ref(false)
const editingStyle = ref(emptyStyle())
const styleError = ref<string | undefined>()

export const resetStyleMenu = () => {
  editing.value = false
  Object.assign(editingStyle, emptyStyle())
  styleError.value = undefined
}

export const useReusableStyleMenu = (): IUseStyleMenuFeature => {
  const { site, editor, currentPseudoClass, addStyle, editStyle } = useBuild()

  const styles = computed(() => {
    return Object.values(site.value?.context.styles ?? {})
  })

  const clearEditingState = () => {
    Object.assign(editingStyle, emptyStyle())
    styleError.value = undefined
    editing.value = false
  }

  const newStyle = () => {
    Object.assign(editingStyle, emptyStyle())
    editing.value = true
  }

  const setEditingStyle = (style: IStyle) => {
    editingStyle.value = structuredClone(toRaw(style))
    editing.value = true
  }

  const getActiveRawStyle = () => {
    let pseudoStyle = editingStyle.value.breakpoints[activeBreakpoint.value.id]
    if (!pseudoStyle) {
      pseudoStyle = editingStyle.value.breakpoints[activeBreakpoint.value.id] = {}
    }

    let rawStyle = pseudoStyle[currentPseudoClass.value]
    if (!rawStyle) {
      rawStyle = pseudoStyle[currentPseudoClass.value] = {}
    }

    return rawStyle
  }

  const editingStyleEntries = computed(() => {
    // Compute breakpoint styles with source
    const breakpointStylesWithSource: IBreakpointStylesWithSource = {}
    Object.entries(editingStyle.value.breakpoints).forEach(
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
              sourceId: editingStyle.value.id ?? '',
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
    )

    return Object.entries(flattenedStyles).map(
      ([css, source]) =>
        ({
          pseudoClass: currentPseudoClass.value,
          property: css as Css,
          value: source.value,
          sourceType: source.sourceType,
          sourceId: source.sourceId,
          sourceBreakpointId: source.sourceBreakpointId,
        }) as IInheritedStyleEntry,
    )
  })

  const newEditingStyleProp = () => {
    const rawStyle = getActiveRawStyle()
    if (!rawStyle[Css.Empty]) {
      rawStyle[Css.Empty] = ''
    }
  }

  const updateEditingStyleProp = (oldProperty: Css, newEntry: IStyleEntry) => {
    const rawStyle = getActiveRawStyle()
    if (oldProperty !== newEntry.property) {
      delete rawStyle[oldProperty]
    }
    rawStyle[newEntry.property] = newEntry.value
  }

  const removeEditingStyleProp = (property: Css) => {
    const rawStyle = getActiveRawStyle()
    delete rawStyle[property]
  }

  const validateStyle = (): boolean => {
    styleError.value = undefined
    if (!editingStyle.value.name) {
      styleError.value = 'Style must have a name'
    } else {
      const rawStyle = getActiveRawStyle()
      const rawStyleEntries = Object.entries(rawStyle)
      if (rawStyleEntries.some(([property]) => property === Css.Empty)) {
        styleError.value = 'Property cannot be empty'
      }
    }
    return !styleError.value
  }

  const saveStyle = () => {
    if (editing.value) {
      if (!validateStyle()) {
        return
      }
      const newStyle = structuredClone(toRaw(editingStyle.value))
      if (editingStyle.value.id) {
        editStyle(newStyle as IStyle)
      } else {
        addStyle(newStyle as IStyle)
      }
    }
    clearEditingState()
  }

  return {
    editing,
    editingStyle,
    editingStyleEntries,
    styleError,
    styles,
    clearEditingState,
    newStyle,
    setEditingStyle,
    newEditingStyleProp,
    updateEditingStyleProp,
    removeEditingStyleProp,
    saveStyle,
  }
}
