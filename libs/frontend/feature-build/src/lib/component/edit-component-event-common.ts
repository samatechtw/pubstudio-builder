import { resolveBehavior } from '@pubstudio/frontend/util-resolve'
import {
  IBehavior,
  IComponentEvent,
  IComponentEventBehavior,
  IEditorEvent,
  ISite,
} from '@pubstudio/shared/type-site'
import { ComputedRef } from 'vue'

export interface IUseEditComponentEventFeature {
  editedEvent: ComputedRef<IEditorEvent | undefined>
  EventValues: string[]
  editOrNewEvent: (
    site: ISite,
    editedEvent: IComponentEvent | undefined,
  ) => IResolvedComponentEvent
  setEditedEvent: (event: IEditorEvent | undefined) => void
  upsertEvent: (event: IEditorEvent, oldEventName?: string) => void
  removeEvent: (name: string) => void
}

export interface IResolvedComponentEventBehavior
  extends Omit<IComponentEventBehavior, 'behaviorId'> {
  behavior: IBehavior
}

export interface IResolvedComponentEvent extends Omit<IComponentEvent, 'behaviors'> {
  behaviors: IResolvedComponentEventBehavior[]
}

export const editEventResolvedBehaviors = (
  site: ISite,
  event: IComponentEvent | IEditorEvent,
): IResolvedComponentEvent => {
  // We can't reuse `resolvedBehavior` here because of race condition.
  const eventBehaviors: IResolvedComponentEventBehavior[] = []

  event.behaviors.forEach((eventBehavior) => {
    const behavior = resolveBehavior(site.context, eventBehavior.behaviorId)
    if (behavior) {
      eventBehaviors.push({
        args: eventBehavior.args,
        behavior,
      })
    }
  })

  return {
    name: event.name,
    eventParams:
      'eventParams' in event && event.eventParams ? { ...event.eventParams } : undefined,
    behaviors: eventBehaviors,
  }
}
