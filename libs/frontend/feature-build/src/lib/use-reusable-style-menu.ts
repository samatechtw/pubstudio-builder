import { setComponentEditStyle } from '@pubstudio/frontend/feature-editor'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import {
  Css,
  CssPseudoClass,
  IActiveBreakpointStyle,
  IPseudoStyle,
  IStyle,
  IStyleEntry,
} from '@pubstudio/shared/type-site'
import { computed, ComputedRef, reactive, Ref, ref, UnwrapNestedRefs } from 'vue'
import { useBuild } from './use-build'

export interface IUseStyleMenuFeature {
  editing: Ref<boolean>
  editingStyle: UnwrapNestedRefs<IEditingStyle>
  styleError: Ref<string | undefined>
  styles: ComputedRef<IStyle[]>
  clearEditingState: () => void
  newStyle: () => void
  setEditingStyle: (style: IStyle) => void
  newEditingStyleProp: () => void
  updateEditingStyleProp: (index: number, newStyle: IStyleEntry) => void
  removeEditingStyleProp: (index: number) => void
  saveStyle: () => void
}

export interface IEditingStyle {
  id?: string
  name: string
  breakpoints: Record<string, IPseudoStyleEntries>
}

type IPseudoStyleEntries = { [key in CssPseudoClass]?: IStyleEntry[] }

const emptyStyle = (): IEditingStyle => ({
  id: undefined,
  name: '',
  breakpoints: {},
})

const editing = ref(false)
const editingStyle = reactive<IEditingStyle>(emptyStyle())
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
    const newEditingStyle: IEditingStyle = {
      id: style.id,
      name: style.name,
      breakpoints: Object.entries(style.breakpoints).reduce(
        (breakpointStyles, [breakpointId, pseudoStyle]) => {
          if (!breakpointStyles[breakpointId]) {
            breakpointStyles[breakpointId] = {}
          }

          const breakpointStyle = breakpointStyles[breakpointId]

          Object.entries(pseudoStyle).forEach(([pseudoKey, rawStyle]) => {
            const pseudoClass = pseudoKey as CssPseudoClass
            if (!breakpointStyle[pseudoClass]) {
              breakpointStyle[pseudoClass] = []
            }

            const styleEntries = breakpointStyle[pseudoClass] as IStyleEntry[]

            Object.entries(rawStyle).forEach(([css, value]) => {
              styleEntries.push({
                pseudoClass,
                property: css as Css,
                value,
              })
            })
          })
          return breakpointStyles
        },
        {} as Record<string, IPseudoStyleEntries>,
      ),
    }
    Object.assign(editingStyle, newEditingStyle)
    editing.value = true
  }

  const getEditingStyleEntries = (): IStyleEntry[] => {
    const activeBreakpointId = activeBreakpoint.value.id

    if (!editingStyle.breakpoints[activeBreakpointId]) {
      editingStyle.breakpoints[activeBreakpointId] = {}
    }

    if (!editingStyle.breakpoints[activeBreakpointId][currentPseudoClass.value]) {
      editingStyle.breakpoints[activeBreakpointId][currentPseudoClass.value] = []
    }

    return editingStyle.breakpoints[activeBreakpointId][
      currentPseudoClass.value
    ] as IStyleEntry[]
  }

  const newEditingStyleProp = () => {
    const editingStyleEntries = getEditingStyleEntries()
    editingStyleEntries.push({
      pseudoClass: currentPseudoClass.value,
      property: Css.Empty,
      value: '',
    })
  }

  const updateEditingStyleProp = (index: number, newStyle: IStyleEntry) => {
    const editingStyleEntries = getEditingStyleEntries()

    const editedEntry = editingStyleEntries[index]
    if (editedEntry?.property === '') {
      // Set component edit style to prevent new style entry from exiting the edit
      // state because we use `${entry.pseudoClass}-${entry.property}` as the key
      //of <StyleRow> in StyleMenuEdit component.
      setComponentEditStyle(editor.value, newStyle.property)
    }

    const samePropertyEntryIndex = editingStyleEntries.findIndex(
      (entry) => entry.property === newStyle.property,
    )
    if (samePropertyEntryIndex >= 0) {
      editingStyleEntries[samePropertyEntryIndex] = newStyle
      if (index !== samePropertyEntryIndex) {
        removeEditingStyleProp(index)
      }
    } else {
      editingStyleEntries[index] = newStyle
    }
  }

  const removeEditingStyleProp = (index: number) => {
    const editingStyleEntries = getEditingStyleEntries()
    editingStyleEntries.splice(index, 1)
  }

  const validateStyle = (): boolean => {
    styleError.value = undefined
    if (!editingStyle.name) {
      styleError.value = 'Style must have a name'
    } else {
      const editingStyleEntries = getEditingStyleEntries()
      if (editingStyleEntries.some((entry) => !entry.property)) {
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
      const editingStyleEntries = getEditingStyleEntries()

      const newStyle: IActiveBreakpointStyle = {
        id: editingStyle.id ?? '',
        name: editingStyle.name,
        pseudoStyle: editingStyleEntries.reduce((pseudoStyle, entry) => {
          const pseudoClass = pseudoStyle[entry.pseudoClass]
          if (pseudoClass) {
            pseudoClass[entry.property] = entry.value
          } else {
            pseudoStyle[entry.pseudoClass] = { [entry.property]: entry.value }
          }
          return pseudoStyle
        }, {} as IPseudoStyle),
      }

      if (editingStyle.id) {
        editStyle(newStyle)
      } else {
        addStyle(newStyle)
      }
    }
    clearEditingState()
  }

  return {
    editing,
    editingStyle,
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
