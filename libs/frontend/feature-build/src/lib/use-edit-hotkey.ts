import { DefaultHotkeys } from '@pubstudio/frontend/feature-builtin-editor'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { useHUD } from '@pubstudio/frontend/util-ui-alert'
import {
  HotkeyStates,
  IHotkeys,
  IInvertedHotkeys,
  Keys,
} from '@pubstudio/shared/type-site'
import { computed, ComputedRef, Ref, ref } from 'vue'

export interface IUseEditHotkey {
  invertedEditorHotkeys: Ref<IInvertedHotkeys>
  isEditing: ComputedRef<boolean>
  setEditing: () => void
  clearEditing: () => void
}

export interface IUseEditHotkeyOptions {
  state: HotkeyStates
  action: string
}

const invertHotkeys = (hotkeys: IHotkeys | undefined): IInvertedHotkeys => {
  return Object.fromEntries(
    Object.keys(hotkeys || {}).map((state) => [
      state,
      Object.fromEntries(
        Object.entries(hotkeys?.[state as HotkeyStates] || {}).map(([k, v]) => [v, k]),
      ),
    ]),
  ) as IInvertedHotkeys
}

export const HotkeyStateKeys = Object.values(HotkeyStates)

export const InvertedHotkeys = invertHotkeys(DefaultHotkeys)

const editingAction = ref<{ state: HotkeyStates; action: string }>()

export const useEditHotkey = (options?: IUseEditHotkeyOptions): IUseEditHotkey => {
  const { site } = useSiteSource()
  const { addHUD } = useHUD()
  const { state, action } = options ?? {}

  const isEditing = computed(() => {
    return state === editingAction.value?.state && action === editingAction.value?.action
  })

  const invertedEditorHotkeys = computed(() => {
    return invertHotkeys(site.value.editor?.hotkeys)
  })

  const setKey = (event: KeyboardEvent): boolean => {
    const editor = site.value.editor
    if (!options || !editor) {
      return false
    }
    const { state, action } = options
    const oldKey = invertedEditorHotkeys.value[state]?.[action]
    const newKey = event.key
    // Key already in use
    if (oldKey !== newKey && editor.hotkeys?.[state]?.[newKey as Keys]) {
      addHUD({ text: `Hotkey used by ${action}` })
    } else if (newKey === Keys.Escape || event.metaKey) {
      clearEditing()
    } else if (!/^[a-zA-Z1-9[\];',./-=]|Tab$/.test(newKey)) {
      addHUD({ text: 'Invalid hotkey' })
    } else {
      const hotkeys = editor.hotkeys ?? {}
      const hotkeyState = hotkeys[state] ?? {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hotkeyState[newKey as Keys] = action as any
      delete hotkeyState[oldKey as Keys]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hotkeys[state] = hotkeyState as any
      editor.hotkeys = hotkeys
      clearEditing()
      editor.store?.saveEditor(editor)
      return true
    }
    clearEditing()
    return false
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (setKey(event)) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

  const setEditing = () => {
    if (!options) {
      return undefined
    }
    if (!editingAction.value) {
      document.addEventListener('keydown', handleKeydown)
    }
    const { state, action } = options
    editingAction.value = { state, action }
  }

  const clearEditing = () => {
    editingAction.value = undefined
    document.removeEventListener('keydown', handleKeydown)
  }

  return { invertedEditorHotkeys, isEditing, setEditing, clearEditing }
}
