import { setComponentEditInput } from '@pubstudio/frontend/data-access-command'
import { ComponentTabState, IComponentInput } from '@pubstudio/shared/type-site'
import { computed, ComputedRef } from 'vue'
import { useBuild } from '../use-build'

export interface IInputUpdate {
  property: string
  newValue: unknown
}

export interface IUseEditComponentInputFeature {
  editedInput: ComputedRef<IComponentInput | undefined>
  isEditingInput: ComputedRef<boolean>
  setEditedInput: (input: IComponentInput | undefined) => void
  upsertInput: (input: IComponentInput) => void
  removeInput: (name: string) => void
  setInputIs: (data: IInputUpdate) => void
}

export const useEditComponentInput = (): IUseEditComponentInputFeature => {
  const { editor, addOrUpdateSelectedInput, removeComponentInput, setSelectedIsInput } =
    useBuild()

  const isEditingInput = computed(() => {
    return editor.value?.componentTab?.state === ComponentTabState.EditInput
  })

  const editedInput = computed(() => {
    const name = editor.value?.componentTab.editInput
    if (name) {
      return editor.value?.selectedComponent?.inputs?.[name]
    }
    return undefined
  })

  const setEditedInput = (input: IComponentInput | undefined) => {
    setComponentEditInput(editor.value, input?.name)
  }

  const upsertInput = (input: IComponentInput) => {
    addOrUpdateSelectedInput(input.name, input)
    setEditedInput(undefined)
  }

  const removeInput = (name: string) => {
    removeComponentInput(name)
    setEditedInput(undefined)
  }

  const setInputIs = (data: IInputUpdate) => {
    setSelectedIsInput(data.property, data.newValue)
  }

  return {
    editedInput,
    isEditingInput,
    setEditedInput,
    upsertInput,
    removeInput,
    setInputIs,
  }
}
