import { setComponentEditEditorEvent } from '@pubstudio/frontend/data-access-command'
import { noBehavior } from '@pubstudio/frontend/feature-builtin'
import { builtinEditorBehaviors } from '@pubstudio/frontend/util-resolve'
import {
  EditorEventName,
  IComponentEvent,
  IEditorEvent,
  ISite,
} from '@pubstudio/shared/type-site'
import { computed } from 'vue'
import { useBuild } from '../use-build'
import {
  editEventResolvedBehaviors,
  IResolvedComponentEvent,
  IUseEditComponentEventFeature,
} from './edit-component-event-common'

const defaultEvent = (): IResolvedComponentEvent => ({
  name: EditorEventName.OnSelfAdded,
  behaviors: [{ behavior: noBehavior }],
})

export const useEditComponentEditorEvent = (): IUseEditComponentEventFeature => {
  const {
    site,
    editor,
    addSelectedComponentEditorEvent,
    updateSelectedComponentEditorEvent,
    removeSelectedComponentEditorEvent,
  } = useBuild()

  // Builtin editor behaviors + custom behaviors
  const behaviorOptions = computed(() => {
    return [
      ...Object.values(site.value.context.behaviors),
      ...Object.values(builtinEditorBehaviors),
    ]
  })

  const editedEvent = computed(() => {
    const name = editor.value?.componentTab.editEditorEvent
    const { selectedComponent } = editor.value ?? {}
    if (name && selectedComponent) {
      return selectedComponent.editorEvents?.[name]
    }
    return undefined
  })

  const editOrNewEvent = (
    site: ISite,
    editedEvent: IEditorEvent | undefined,
  ): IResolvedComponentEvent => {
    if (!editedEvent) {
      return defaultEvent()
    }
    return editEventResolvedBehaviors(site, editedEvent)
  }

  const setEditedEvent = (event: IEditorEvent | undefined) => {
    setComponentEditEditorEvent(editor.value, event?.name as EditorEventName)
  }

  const upsertEvent = (event: IComponentEvent, oldEventName?: string) => {
    const selectedComponent = editor.value?.selectedComponent
    if (selectedComponent) {
      if (
        oldEventName &&
        selectedComponent.editorEvents &&
        oldEventName in selectedComponent.editorEvents
      ) {
        updateSelectedComponentEditorEvent(oldEventName, event)
      } else {
        addSelectedComponentEditorEvent(event)
      }
      setEditedEvent(undefined)
    }
  }

  const removeEvent = (name: string) => {
    removeSelectedComponentEditorEvent(name)
    setEditedEvent(undefined)
  }

  return {
    editedEvent,
    behaviorOptions,
    EventValues: Object.values(EditorEventName),
    editOrNewEvent,
    setEditedEvent,
    upsertEvent,
    removeEvent,
  }
}
