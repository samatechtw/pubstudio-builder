import { iterateComponent } from '@pubstudio/frontend/util-render'
import {
  IBehavior,
  IComponent,
  IComponentStyleOverrides,
  ISerializedComponent,
  ISite,
  IStyle,
} from '@pubstudio/shared/type-site'

const makeReplaceId = (oldNamespace: string, namespace: string) => {
  return (id: string) => id.replace(oldNamespace, namespace)
}
const makeIdRegex = (namespace: string) => {
  return () => new RegExp(`${namespace}(-[a-z]{1,2}-[a-zA-Z0-9]+)`, 'g')
}
const hasId = (idRegex: RegExp, text: unknown | undefined) => {
  if (!text || typeof text !== 'string') {
    return false
  }
  return idRegex.test(text)
}

const replaceComponentNamespace = (
  component: IComponent,
  oldNamespace: string,
  newNamespace: string,
): IComponent => {
  const replaceId = makeReplaceId(oldNamespace, newNamespace)
  const idRegex = makeIdRegex(oldNamespace)

  const newId = replaceId(component.id)
  component.id = newId
  // Mixin styles
  if (component.style.mixins) {
    component.style.mixins = component.style.mixins.map(replaceId)
  }
  // Override styles
  if (component.style.overrides) {
    const newOverrides: IComponentStyleOverrides = {}
    for (const [key, style] of Object.entries(component.style.overrides)) {
      newOverrides[replaceId(key)] = style
    }
    component.style.overrides = newOverrides
  }
  // Inputs
  if (component.inputs) {
    for (const input of Object.values(component.inputs)) {
      if (hasId(idRegex(), input.default)) {
        input.default = replaceId(input.default)
      }
      if (hasId(idRegex(), input.is)) {
        input.is = replaceId(input.is as string)
      }
    }
  }
  // Event behavior inputs
  if (component.events) {
    for (const event of Object.values(component.events)) {
      for (const behavior of event.behaviors) {
        behavior.behaviorId = replaceId(behavior.behaviorId)
        if (behavior.args) {
          for (const [argName, arg] of Object.entries(behavior.args)) {
            if (typeof arg === 'string' && arg.startsWith(oldNamespace)) {
              behavior.args[argName] = replaceId(arg)
            }
          }
        }
      }
    }
  }
  // Editor event behavior inputs
  if (component.editorEvents) {
    for (const event of Object.values(component.editorEvents)) {
      for (const behavior of event.behaviors) {
        behavior.behaviorId = replaceId(behavior.behaviorId)
        if (behavior.args) {
          for (const [argName, arg] of Object.entries(behavior.args)) {
            if (typeof arg === 'string' && arg.startsWith(oldNamespace)) {
              behavior.args[argName] = replaceId(arg)
            }
          }
        }
      }
    }
  }
  return component
}

const replaceBehaviorsNamespace = (
  behaviors: Record<string, IBehavior>,
  oldNamespace: string,
  newNamespace: string,
) => {
  const replaceId = makeReplaceId(oldNamespace, newNamespace)
  const idRegex = makeIdRegex(oldNamespace)

  const updateAll = (str: string): string => {
    return str.replaceAll(idRegex(), `${newNamespace}$1`)
  }
  for (const [behaviorId, behavior] of Object.entries(behaviors)) {
    const newId = replaceId(behaviorId)
    behavior.id = newId
    delete behaviors[behaviorId]
    behaviors[newId] = behavior

    if (behavior.code) {
      behavior.code = updateAll(behavior.code)
    }
    if (behavior.args) {
      for (const [name, arg] of Object.entries(behavior.args)) {
        if (hasId(idRegex(), arg.default)) {
          behavior.args[name].default = replaceId(arg.default as string)
        }
      }
    }
  }
}

const replaceMixinsNamespace = (
  mixins: Record<string, IStyle>,
  oldNamespace: string,
  newNamespace: string,
) => {
  const replaceId = makeReplaceId(oldNamespace, newNamespace)
  for (const [mixinId, mixin] of Object.entries(mixins)) {
    const newId = replaceId(mixinId)
    mixin.id = newId
    delete mixins[mixinId]
    mixins[newId] = mixin
  }
}

// Replace all references to the site namespace
export const replaceNamespace = (site: ISite, namespace: string): ISite => {
  const { context, editor } = site
  const oldNamespace = context.namespace
  const replaceId = makeReplaceId(oldNamespace, namespace)

  context.namespace = namespace
  context.styleOrder = context.styleOrder.map(replaceId)
  // Update styles
  replaceMixinsNamespace(context.styles, oldNamespace, namespace)
  // Update components
  for (const [cmpId, component] of Object.entries(context.components)) {
    delete context.components[cmpId]
    const newC = replaceComponentNamespace(component, oldNamespace, namespace)
    context.components[newC.id] = newC
  }
  // Update behaviors
  replaceBehaviorsNamespace(context.behaviors, oldNamespace, namespace)
  // Update editor fields
  if (editor) {
    const expandedItems = editor.componentTreeExpandedItems ?? {}
    for (const [cmpId, expanded] of Object.entries(expandedItems)) {
      const newId = replaceId(cmpId)
      delete editor.componentTreeExpandedItems[cmpId]
      editor.componentTreeExpandedItems[newId] = expanded
    }
    const componentsHidden = editor.componentsHidden ?? {}
    for (const [cmpId, hidden] of Object.entries(componentsHidden)) {
      const newId = replaceId(cmpId)
      delete editor.componentsHidden[cmpId]
      editor.componentsHidden[newId] = hidden
    }
    editor.editBehavior = undefined
    editor.hoveredComponent = undefined
    editor.selectedComponent = undefined
  }
  return site
}

// Replaces a component's namespace, including children
// This is somewhat inefficient, since  breakpoints, behaviors, styles have already been replaced
export const replacePastedComponentNamespace = (
  component: ISerializedComponent,
  oldNamespace: string,
  newNamespace: string,
): ISerializedComponent => {
  // Replace component IDs
  iterateComponent(component, (cmp) =>
    replaceComponentNamespace(cmp, oldNamespace, newNamespace),
  )
  return component
}
