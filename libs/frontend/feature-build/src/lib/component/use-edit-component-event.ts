import {
  getMissingBehaviorIds,
  setComponentEditEvent,
} from '@pubstudio/frontend/data-access-command'
import { builtinBehaviors, noBehavior } from '@pubstudio/frontend/util-builtin'
import { resolveBehavior, resolveComponent } from '@pubstudio/frontend/util-resolve'
import { ComponentEventType, IComponentEvent, ISite } from '@pubstudio/shared/type-site'
import { computed } from 'vue'
import { useBuild } from '../use-build'
import {
  editEventResolvedBehaviors,
  IResolvedComponentEvent,
  IUseEditComponentEventFeature,
} from './edit-component-event-common'

export const ComponentEventTypeValues: ComponentEventType[] =
  Object.values(ComponentEventType)

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

  // Builtin behaviors + custom behaviors
  const behaviorOptions = computed(() => {
    return [
      ...Object.values(site.value.context.behaviors),
      ...Object.values(builtinBehaviors),
    ]
  })

  const editedEvent = computed(() => {
    const name = editor.value?.componentTab.editEvent
    const { selectedComponent } = editor.value ?? {}
    if (name && selectedComponent) {
      const customCmp = resolveComponent(
        site.value.context,
        selectedComponent.customSourceId,
      )

      const mergedEvents = {
        ...customCmp?.events,
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
      const missingBehaviorIds = getMissingBehaviorIds(site.value, event)
      if (
        oldEventName &&
        selectedComponent.events &&
        oldEventName in selectedComponent.events
      ) {
        updateSelectedComponentEvent(oldEventName, event, missingBehaviorIds)
      } else {
        addSelectedComponentEvent(event, missingBehaviorIds)
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
    behaviorOptions,
    EventValues: ComponentEventTypeValues,
    editOrNewEvent,
    setEditedEvent,
    upsertEvent,
    removeEvent,
  }
}
