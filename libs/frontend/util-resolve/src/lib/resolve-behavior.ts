import { defaultContext } from '@pubstudio/frontend/util-ids'
import {
  ComponentEventType,
  IBehavior,
  IResolvedBehavior,
  ISiteContext,
} from '@pubstudio/shared/type-site'

export const builtinBehaviors: Record<string, IBehavior> = {
  // Populated by '@pubstudio/frontend/feature-builtin' to avoid circular dependencies
}

export const registerBuiltinBehavior = (behavior: IBehavior) => {
  builtinBehaviors[behavior.id] = behavior
}

// Events triggered by Vue
export const NativeEvents: Record<string, string> = {
  click: 'onClick',
  mouseover: 'onMouseover',
  mouseleave: 'onMouseleave',
  submit: 'onSubmit',
  [ComponentEventType.Input]: 'onInput',
}

export const resolveBehaviorFunction = (
  behavior: IBehavior | undefined,
): IResolvedBehavior | undefined => {
  if (behavior) {
    if (behavior.builtin) {
      return behavior.builtin
    }
    return Function(
      'helpers',
      'behaviorContext',
      'args',
      `"use strict";const {setState,setIsInput}=helpers;const {site,component}=behaviorContext;${behavior.code};`,
    ) as IResolvedBehavior
  }
  return undefined
}

export const resolveBehavior = (
  context: ISiteContext,
  behaviorId: string,
): IBehavior | undefined => {
  let behavior: IBehavior | undefined
  if (behaviorId.startsWith(context.namespace)) {
    behavior = context.behaviors[behaviorId]
  } else if (behaviorId.startsWith(defaultContext.namespace)) {
    // Builtins are native code and don't need to be eval'd
    return builtinBehaviors[behaviorId]
  } else {
    // TODO -- resolve external namespaces
  }
  return behavior
}
