import { globalContext } from '@pubstudio/frontend/util-defaults'
import { IBehavior, IResolvedBehavior, ISiteContext } from '@pubstudio/shared/type-site'

export const builtinEditorBehaviors: Record<string, IBehavior> = {
  // Populated by '@pubstudio/frontend/feature-builtin-editor' to avoid circular dependencies
}

export const registerEditorBehavior = (behavior: IBehavior) => {
  builtinEditorBehaviors[behavior.id] = behavior
}

// Events triggered by Vue
export const NativeEvents: Record<string, string> = {
  click: 'onClick',
  mouseover: 'onMouseover',
  mouseleave: 'onMouseleave',
  submit: 'onSubmit',
  input: 'onInput',
  keydown: 'onKeydownPrevent',
  keyup: 'onKeyupPrevent',
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
      `"use strict";const {getState,setState,setIsInput}=helpers;const {site,component,event}=behaviorContext;${behavior.code};`,
    ) as IResolvedBehavior
  }
  return undefined
}

export const resolveBehavior = (
  context: ISiteContext,
  behaviorId: string,
): IBehavior | undefined => {
  if (!behaviorId) {
    return undefined
  }
  return context.behaviors[behaviorId] ?? builtinEditorBehaviors[behaviorId]
}
