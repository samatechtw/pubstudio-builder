import { resolveBehavior } from '@pubstudio/frontend/util-resolve'
import { ISetBehaviorArgData } from '@pubstudio/shared/type-command-data'
import { IBehavior, IBehaviorArg, ISite } from '@pubstudio/shared/type-site'

const removeArg = (behavior: IBehavior | undefined, arg: IBehaviorArg | undefined) => {
  if (arg && behavior && behavior.args) {
    delete behavior.args[arg.name]
  }
}

const addArg = (behavior: IBehavior | undefined, arg: IBehaviorArg) => {
  if (behavior) {
    if (!behavior.args) {
      behavior.args = {}
    }
    behavior.args[arg.name] = arg
  }
}

const setBehaviorArg = (
  behavior: IBehavior | undefined,
  oldArg: IBehaviorArg | undefined,
  newArg: IBehaviorArg | undefined,
) => {
  // Add or change
  if (newArg !== undefined) {
    removeArg(behavior, oldArg)
    addArg(behavior, newArg)
  } else {
    // Remove input
    removeArg(behavior, oldArg)
  }
  if (behavior?.args && Object.values(behavior?.args ?? []).length === 0) {
    behavior.args = undefined
  }
}

export const applySetBehaviorArg = (site: ISite, data: ISetBehaviorArgData) => {
  const { behaviorId, oldArg, newArg } = data
  const behavior = resolveBehavior(site.context, behaviorId)
  setBehaviorArg(behavior, oldArg, newArg)
}

export const undoSetBehaviorArg = (site: ISite, data: ISetBehaviorArgData) => {
  const { behaviorId, oldArg, newArg } = data
  const behavior = resolveBehavior(site.context, behaviorId)
  setBehaviorArg(behavior, newArg, oldArg)
}
