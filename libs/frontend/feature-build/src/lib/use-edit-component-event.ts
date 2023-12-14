import { ComponentTabState, IComponentEvent } from '@pubstudio/shared/type-site'
import { computed, ComputedRef } from 'vue'
import { setComponentEditEvent } from './editor-helpers'
import { useBuild } from './use-build'

export interface IUseEditComponentEventFeature {
  editedEvent: ComputedRef<IComponentEvent | undefined>
  isEditingEvent: ComputedRef<boolean>
  setEditedEvent: (event: IComponentEvent | undefined) => void
  upsertEvent: (event: IComponentEvent, oldEventName?: string) => void
  removeEvent: (name: string) => void
}

export const useEditComponentEvent = (): IUseEditComponentEventFeature => {
  const { editor, addComponentEvent, updateComponentEvent, removeComponentEvent } =
    useBuild()

  const isEditingEvent = computed(() => {
    return editor.value?.componentTab?.state === ComponentTabState.EditEvent
  })

  const editedEvent = computed(() => {
    const name = editor.value?.componentTab.editEvent
    if (name) {
      return editor.value?.selectedComponent?.events?.[name]
    }
    return undefined
  })

  const setEditedEvent = (event: IComponentEvent | undefined) => {
    setComponentEditEvent(editor.value, event?.name)
  }

  const upsertEvent = (event: IComponentEvent, oldEventName?: string) => {
    const selectedComponent = editor.value?.selectedComponent
    if (selectedComponent) {
      if (oldEventName) {
        updateComponentEvent(oldEventName, event)
      } else {
        addComponentEvent(event)
      }
      setEditedEvent(undefined)
    }
  }

  const removeEvent = (name: string) => {
    removeComponentEvent(name)
    setEditedEvent(undefined)
  }

  return {
    editedEvent,
    isEditingEvent,
    setEditedEvent,
    upsertEvent,
    removeEvent,
  }
}
