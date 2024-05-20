import {
  behaviorHelpers,
  resolveBehavior,
  resolveBehaviorFunction,
} from '@pubstudio/frontend/util-resolve'
import {
  IBehaviorContext,
  IComponent,
  IComponentEventBehavior,
  ISite,
} from '@pubstudio/shared/type-site'

export const triggerEventBehaviors = async (
  behaviors: IComponentEventBehavior[],
  site: ISite,
  component: IComponent,
  event?: Event,
) => {
  // Delay behavior resolution to speed up rendering
  for (const eventBehavior of behaviors) {
    const behavior = resolveBehavior(site.context, eventBehavior.behaviorId)
    const fn = resolveBehaviorFunction(behavior)
    // TODO -- resolve context/component here to reduce closure memory?
    const behaviorContext: IBehaviorContext = {
      site,
      component,
      event,
    }
    await fn?.(behaviorHelpers, behaviorContext, eventBehavior.args ?? {})
  }
}
