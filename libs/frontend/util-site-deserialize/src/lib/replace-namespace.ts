import { ISite } from '@pubstudio/shared/type-site'

// Replace all references to the site namespace
export const replaceNamespace = (site: ISite, namespace: string): ISite => {
  const { context, editor } = site
  const oldNamespace = context.namespace
  const updateId = (id: string): string => {
    return id.replace(oldNamespace, namespace)
  }
  const idRegex = new RegExp(`${oldNamespace}(-[a-z]{1,2}-[a-zA-Z0-9]+)`, 'g')
  const updateAll = (str: string): string => {
    return str.replaceAll(idRegex, `${namespace}$1`)
  }
  const hasId = (text: unknown | undefined) => {
    if (!text || typeof text !== 'string') {
      return false
    }
    return idRegex.test(text)
  }

  context.namespace = namespace
  // Update styles
  for (const [mixinId, mixin] of Object.entries(context.styles)) {
    const newId = updateId(mixinId)
    mixin.id = newId
    delete context.styles[mixinId]
    context.styles[newId] = mixin
  }
  // Update components
  for (const [cmpId, component] of Object.entries(context.components)) {
    const newId = updateId(cmpId)
    component.id = newId
    delete context.components[cmpId]
    context.components[newId] = component
    if (component.style.mixins) {
      component.style.mixins = component.style.mixins.map(updateId)
    }
    if (component.inputs) {
      for (const input of Object.values(component.inputs)) {
        if (hasId(input.default)) {
          input.default = updateId(input.default)
        }
        if (hasId(input.is)) {
          input.is = updateId(input.is as string)
        }
      }
    }
    // Update event behavior inputs
    if (component.events) {
      for (const event of Object.values(component.events)) {
        for (const behavior of event.behaviors) {
          behavior.behaviorId = updateId(behavior.behaviorId)
          if (behavior.args) {
            for (const [argName, arg] of Object.entries(behavior.args)) {
              if (typeof arg === 'string' && arg.startsWith(oldNamespace)) {
                behavior.args[argName] = updateId(arg)
              }
            }
          }
        }
      }
    }
  }
  // Update behaviors
  for (const [behaviorId, behavior] of Object.entries(context.behaviors)) {
    const newId = updateId(behaviorId)
    behavior.id = newId
    delete context.behaviors[behaviorId]
    context.behaviors[newId] = behavior

    if (behavior.code) {
      behavior.code = updateAll(behavior.code)
    }
    if (behavior.args) {
      for (const [name, arg] of Object.entries(behavior.args)) {
        if (hasId(arg.default)) {
          behavior.args[name].default = updateId(arg.default as string)
        }
      }
    }
  }
  // Update editor fields
  if (editor) {
    const expandedItems = editor.componentTreeExpandedItems ?? {}
    for (const [cmpId, expanded] of Object.entries(expandedItems)) {
      const newId = updateId(cmpId)
      delete editor.componentTreeExpandedItems[cmpId]
      editor.componentTreeExpandedItems[newId] = expanded
    }
    const componentsHidden = editor.componentsHidden ?? {}
    for (const [cmpId, hidden] of Object.entries(componentsHidden)) {
      const newId = updateId(cmpId)
      delete editor.componentsHidden[cmpId]
      editor.componentsHidden[newId] = hidden
    }
    editor.editBehavior = undefined
    editor.copiedComponent = undefined
    editor.hoveredComponent = undefined
    editor.selectedComponent = undefined
  }
  return site
}
