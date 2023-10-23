import { ISetBehaviorData } from '@pubstudio/shared/type-command-data'
import { IBehavior, ISite, ISiteContext } from '@pubstudio/shared/type-site'

const removeBehavior = (context: ISiteContext, behavior: IBehavior | undefined) => {
  if (behavior) {
    delete context.behaviors[behavior.id]
  }
}

const addBehavior = (context: ISiteContext, behavior: IBehavior) => {
  if (!context.behaviors) {
    context.behaviors = {}
  }
  context.behaviors[behavior.id] = behavior
}

const setBehavior = (
  context: ISiteContext,
  oldBehavior: IBehavior | undefined,
  newBehavior: IBehavior | undefined,
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
