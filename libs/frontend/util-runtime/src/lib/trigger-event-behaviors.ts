import {
  behaviorHelpers,
  resolveBehavior,
  resolveBehaviorFunction,
} from '@pubstudio/frontend/util-builtin'
import {
  IBehaviorContext,
  IComponent,
  IComponentEventBehavior,
  ISite,
} from '@pubstudio/shared/type-site'

export const triggerEventBehaviors = (
  behaviors: IComponentEventBehavior[],
  site: ISite,
  component: IComponent,
) => {
  // Delay behavior resolution to speed up rendering
  behaviors.forEach((eventBehavior) => {
    const behavior = resolveBehavior(site.context, eventBehavior.behaviorId)
    const fn = resolveBehaviorFunction(behavior)
    // TODO -- resolve context/component here to reduce closure memory?
    const behaviorContext: IBehaviorContext = {
      site,
      component,
    }
    fn?.(behaviorHelpers, behaviorContext, eventBehavior.args ?? {})
  })
}
