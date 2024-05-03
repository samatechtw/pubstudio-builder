import { setComponentEditEvent } from '@pubstudio/frontend/data-access-command'
import { noBehavior } from '@pubstudio/frontend/feature-builtin'
import { resolveBehavior } from '@pubstudio/frontend/util-builtin'
import {
  ComponentEventType,
  IBehavior,
  IComponentEvent,
  IComponentEventBehavior,
  ISite,
} from '@pubstudio/shared/type-site'
import { computed, ComputedRef } from 'vue'
import { useBuild } from './use-build'

export interface IUseEditComponentEventFeature {
  editedEvent: ComputedRef<IComponentEvent | undefined>
  setEditedEvent: (event: IComponentEvent | undefined) => void
  upsertEvent: (event: IComponentEvent, oldEventName?: string) => void
  removeEvent: (name: string) => void
}

export interface IResolvedComponentEventBehavior
  extends Omit<IComponentEventBehavior, 'behaviorId'> {
  behavior: IBehavior
}

export interface IResolvedComponentEvent extends Omit<IComponentEvent, 'behaviors'> {
  behaviors: IResolvedComponentEventBehavior[]
}

const defaultEvent = (): IResolvedComponentEvent => ({
  name: ComponentEventType.Click,
  behaviors: [
    {
      behavior: noBehavior,
    },
  ],
})

export const editOrNewEvent = (
  site: ISite,
  editedEvent: IComponentEvent | undefined,
): IResolvedComponentEvent => {
  if (!editedEvent) {
    return defaultEvent()
  }

  // We can't reuse `resolvedBehavior` here because of race condition.
  const eventBehaviors: IResolvedComponentEventBehavior[] = []

  editedEvent.behaviors.forEach((eventBehavior) => {
    const behavior = resolveBehavior(site.context, eventBehavior.behaviorId)
    if (behavior) {
      eventBehaviors.push({
        args: eventBehavior.args,
        behavior,
      })
    }
  })

  return {
    name: editedEvent.name,
    eventParams: editedEvent.eventParams ? { ...editedEvent.eventParams } : undefined,
    behaviors: eventBehaviors,
  }
}

export const useEditComponentEvent = (): IUseEditComponentEventFeature => {
  const {
    editor,
    addSelectedComponentEvent,
    updateSelectedComponentEvent,
    removeSelectedComponentEvent,
  } = useBuild()

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
    setEditedEvent,
    upsertEvent,
    removeEvent,
  }
}
