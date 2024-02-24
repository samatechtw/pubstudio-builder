import { selectColor } from '@pubstudio/frontend/data-access-command'
import { IThemeVariable } from '@pubstudio/shared/type-site'
import { useI18n } from 'petite-vue-i18n'
import { reactive, Ref, ref, UnwrapNestedRefs } from 'vue'
import { useBuild } from './use-build'
import { MAX_SELECTED_THEME_COLORS, useThemeColors } from './use-theme-colors'

export interface IUseThemeMenuFeature {
  editState: Ref<IThemeVariableEditState>
  editingThemeVariable: UnwrapNestedRefs<IThemeVariable>
  themeVariableError: Ref<string | undefined>
  clearEditingState: () => void
  newThemeVariable: () => void
  setEditingThemeVariable: (
    themeVariable: IThemeVariable,
    state: IThemeVariableEditState,
  ) => void
  saveThemeVariable: () => void
}

export interface IThemeColorPickerData {
  state: IThemeVariableEditState
  variable: IThemeVariable
  top: number
}

export interface IThemeVariables {
  builtin: IThemeVariable[]
  custom: IThemeVariable[]
}

export enum IThemeVariableEditState {
  None,
  Builtin,
  Custom,
}

const emptyThemeVariable = (): IThemeVariable => ({
  key: '',
  value: '',
  resolved: '',
  isColor: false,
})

const editState = ref<IThemeVariableEditState>(IThemeVariableEditState.None)
const editingThemeVariable = reactive<IThemeVariable>(emptyThemeVariable())
const editingThemeVariableSource = reactive<IThemeVariable>(emptyThemeVariable())
const showNewProp = ref(false)
const themeVariableError = ref<string | undefined>()

export const resetThemeMenuVariables = () => {
  editState.value = IThemeVariableEditState.None
  Object.assign(editingThemeVariable, emptyThemeVariable())
  Object.assign(editingThemeVariableSource, emptyThemeVariable())
  showNewProp.value = false
  themeVariableError.value = undefined
}

export const useThemeMenuVariables = (): IUseThemeMenuFeature => {
  const { t } = useI18n()
  const { site, addThemeVariable, editThemeVariable } = useBuild()
  const { selectedThemeColors } = useThemeColors()

  const clearEditingState = () => {
    Object.assign(editingThemeVariable, emptyThemeVariable())
    Object.assign(editingThemeVariableSource, emptyThemeVariable())
    themeVariableError.value = undefined
    editState.value = IThemeVariableEditState.None
  }

  const newThemeVariable = () => {
    Object.assign(editingThemeVariable, emptyThemeVariable())
    Object.assign(editingThemeVariableSource, emptyThemeVariable())
    editState.value = IThemeVariableEditState.Custom
  }

  const setEditingThemeVariable = (
    themeVariable: IThemeVariable,
    state: IThemeVariableEditState,
  ) => {
    Object.assign(editingThemeVariable, themeVariable)
    Object.assign(editingThemeVariableSource, themeVariable)
    editState.value = state
  }

  const validateThemeVariable = (): boolean => {
    themeVariableError.value = undefined
    if (!editingThemeVariable.key) {
      themeVariableError.value = t('errors.theme_var_name_missing')
    } else if (!editingThemeVariable.value) {
      themeVariableError.value = t('errors.value_empty')
    } else if (
      editingThemeVariable.key !== editingThemeVariableSource.key &&
      editingThemeVariable.key in (site.value?.context.theme.variables ?? {})
    ) {
      themeVariableError.value = t('errors.theme_var_name_unique')
    }
    return !themeVariableError.value
  }

  const saveThemeVariable = () => {
    if (!editState.value || !validateThemeVariable()) {
      return
    }

    const oldKey = editingThemeVariableSource.key
    if (oldKey in (site.value.context.theme.variables ?? {})) {
      // Pass in the copy of variables to avoid passing by reference issue
      editThemeVariable({
        oldThemeVariable: { ...editingThemeVariableSource },
        newThemeVariable: { ...editingThemeVariable },
      })
    } else {
      addThemeVariable({
        key: editingThemeVariable.key,
        value: editingThemeVariable.value,
      })
      if (selectedThemeColors.value.length < MAX_SELECTED_THEME_COLORS) {
        selectColor(site.value.editor, editingThemeVariable.key)
      }
    }
    clearEditingState()
  }

  return {
    editState,
    editingThemeVariable,
    themeVariableError,
    clearEditingState,
    newThemeVariable,
    setEditingThemeVariable,
    saveThemeVariable,
  }
}
