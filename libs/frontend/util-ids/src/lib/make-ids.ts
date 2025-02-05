import { ISiteContext } from '@pubstudio/shared/type-site'

// Generate the next ID in `context`
export const nextId = (context: ISiteContext): string => {
  const id = context.nextId
  context.nextId += 1
  return id.toString()
}

export const behaviorId = (namespace: string, id: string | number): string => {
  return `${namespace}-b-${id}`
}

// Get the latest behavior ID in the namespace
export const latestBehaviorId = (context: ISiteContext): string => {
  return behaviorId(context.namespace, context.nextId - 1)
}

export const nextBehaviorId = (context: ISiteContext) => {
  return behaviorId(context.namespace, nextId(context))
}

// Get the latest component ID in the namespace
export const latestComponentId = (context: ISiteContext): string => {
  return `${context.namespace}-c-${context.nextId - 1}`
}

export const componentId = (namespace: string, id: string): string => {
  return `${namespace}-c-${id}`
}

export const nextComponentId = (context: ISiteContext) => {
  return componentId(context.namespace, nextId(context))
}

export const styleId = (namespace: string, id: string): string => {
  return `${namespace}-s-${id}`
}

export const nextStyleId = (context: ISiteContext) => {
  return styleId(context.namespace, nextId(context))
}

// Get the latest style ID in the namespace
export const latestStyleId = (context: ISiteContext): string => {
  return `${context.namespace}-s-${context.nextId - 1}`
}

export const breakpointId = (namespace: string, id: string): string => {
  return `${namespace}-bp-${id}`
}

export const nextBreakpointId = (context: ISiteContext): string => {
  return breakpointId(context.namespace, nextId(context))
}
