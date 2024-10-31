import {
  globalContext,
  noBehaviorId,
  selectLanguageBehaviorId,
  setupLanguageBehaviorId,
} from '@pubstudio/frontend/util-ids'
import {
  ComponentArgPrimitive,
  IBehavior,
  IResolvedBehavior,
  ISiteContext,
} from '@pubstudio/shared/type-site'

export const noBehavior: IBehavior = { id: noBehaviorId, name: 'None', code: '' }

export const selectLanguage: IBehavior = {
  id: selectLanguageBehaviorId,
  name: 'SelectLanguage',
  args: {
    language: {
      name: 'language',
      type: ComponentArgPrimitive.String,
      default: 'en',
      help: 'Language code',
    },
  },
  code: 'helpers.setLanguage(site, args.language)',
}

export const setupLanguage: IBehavior = {
  id: setupLanguageBehaviorId,
  name: 'SetupLanguage',
  args: {
    default: {
      name: 'default',
      type: ComponentArgPrimitive.String,
      default: 'en',
      help: 'Language code',
    },
  },
  code: 'helpers.setContent(component, site.context.activeI18n ?? args.default)',
}

export const builtinBehaviors: Record<string, IBehavior> = {
  // Populated by '@pubstudio/frontend/feature-builtin' to avoid circular dependencies
  [noBehaviorId]: noBehavior,
  [selectLanguageBehaviorId]: selectLanguage,
  [setupLanguageBehaviorId]: setupLanguage,
}

export const builtinEditorBehaviors: Record<string, IBehavior> = {
  // Populated by '@pubstudio/frontend/feature-builtin' to avoid circular dependencies
}

export const registerBuiltinBehavior = (behavior: IBehavior) => {
  builtinBehaviors[behavior.id] = behavior
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
  let behavior: IBehavior | undefined
  if (behaviorId.startsWith(context.namespace)) {
    behavior = context.behaviors[behaviorId]
  } else if (behaviorId.startsWith(globalContext.namespace)) {
    // Builtins are native code and don't need to be eval'd
    return builtinBehaviors[behaviorId] ?? builtinEditorBehaviors[behaviorId]
  } else {
    // TODO -- resolve external namespaces
  }
  return behavior
}
