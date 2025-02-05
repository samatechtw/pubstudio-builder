import { latestBehaviorId, nextBehaviorId } from '@pubstudio/frontend/util-ids'
import { INewBehavior, ISetBehaviorData } from '@pubstudio/shared/type-command-data'
import { ISite, ISiteContext } from '@pubstudio/shared/type-site'

const removeBehavior = (context: ISiteContext, behavior: INewBehavior | undefined) => {
  if (behavior) {
    // The ID is only missing when undoing an add-behavior, so it's safe to assume
    // the latest generated ID belongs to the behavior.
    const id = behavior.id ?? latestBehaviorId(context)
    delete context.behaviors[id]
    if (!behavior.id) {
      context.nextId -= 1
    }
  }
}

const addBehavior = (context: ISiteContext, behavior: INewBehavior) => {
  if (!context.behaviors) {
    context.behaviors = {}
  }
  const id = behavior.id ?? nextBehaviorId(context)

  context.behaviors[id] = {
    ...behavior,
    id,
  }
}

const setBehavior = (
  context: ISiteContext,
  oldBehavior: INewBehavior | undefined,
  newBehavior: INewBehavior | undefined,
) => {
  // Add or change
  if (newBehavior !== undefined) {
    removeBehavior(context, oldBehavior)
    addBehavior(context, newBehavior)
  } else {
    // Remove behavior
    removeBehavior(context, oldBehavior)
  }
}

export const applySetBehavior = (site: ISite, data: ISetBehaviorData) => {
  const { oldBehavior, newBehavior } = data
  setBehavior(site.context, oldBehavior, newBehavior)
}

export const undoSetBehavior = (site: ISite, data: ISetBehaviorData) => {
  const { oldBehavior, newBehavior } = data
  setBehavior(site.context, newBehavior, oldBehavior)
}
