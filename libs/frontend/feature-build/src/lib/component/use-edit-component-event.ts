import { setComponentEditEvent } from '@pubstudio/frontend/data-access-command'
import { noBehavior } from '@pubstudio/frontend/feature-builtin'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import {
  ComponentEventType,
  ComponentEventTypeValues,
  IComponentEvent,
  ISite,
} from '@pubstudio/shared/type-site'
import { computed } from 'vue'
import { useBuild } from '../use-build'
import {
  editEventResolvedBehaviors,
  IResolvedComponentEvent,
  IUseEditComponentEventFeature,
} from './edit-component-event-common'

export const defaultEvent = (): IResolvedComponentEvent => ({
  name: ComponentEventType.Click,
  behaviors: [{ behavior: noBehavior }],
})

export const useEditComponentEvent = (): IUseEditComponentEventFeature => {
  const {
    site,
    editor,
    addSelectedComponentEvent,
    updateSelectedComponentEvent,
    removeSelectedComponentEvent,
  } = useBuild()

  const editedEvent = computed(() => {
    const name = editor.value?.componentTab.editEvent
    const { selectedComponent } = editor.value ?? {}
    if (name && selectedComponent) {
      const reusableCmp = resolveComponent(
        site.value.context,
        selectedComponent.reusableSourceId,
      )

      const mergedEvents = {
        ...reusableCmp?.events,
        ...selectedComponent.events,
      }

      return mergedEvents?.[name]
    }
    return undefined
  })

  const editOrNewEvent = (
    site: ISite,
    editedEvent: IComponentEvent | undefined,
  ): IResolvedComponentEvent => {
    if (!editedEvent) {
      return defaultEvent()
    }
    return editEventResolvedBehaviors(site, editedEvent)
  }

  const setEditedEvent = (event: IComponentEvent | undefined) => {
    setComponentEditEvent(editor.value, event?.name)
  }

  const upsertEvent = (event: IComponentEvent, oldEventName?: string) => {
    const selectedComponent = editor.value?.selectedComponent
    if (selectedComponent) {
      if (
        oldEventName &&
        selectedComponent.events &&
        oldEventName in selectedComponent.events
      ) {
        updateSelectedComponentEvent(oldEventName, event)
      } else {
        addSelectedComponentEvent(event)
      }
      setEditedEvent(undefined)
    }
  }

  const removeEvent = (name: string) => {
    removeSelectedComponentEvent(name)
    setEditedEvent(undefined)
  }

  return {
    editedEvent,
    EventValues: ComponentEventTypeValues,
    editOrNewEvent,
    setEditedEvent,
    upsertEvent,
    removeEvent,
  }
}
