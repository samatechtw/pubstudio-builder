import { ISiteContext } from '@pubstudio/shared/type-site'

// API-backed editors set this to their stable per-tab collaboration client ID.
// Keeping it module-local makes allocation private to the browser tab while retaining
// the readable legacy counter. Existing IDs and non-collaborative stores are unchanged.
// The suffix uses `_` because `parseNamespace` splits IDs on `-`.
let collaborationClientId: string | undefined

export const setCollaborationClientId = (clientId: string | undefined): void => {
  collaborationClientId = clientId
}

const formatId = (id: number): string =>
  collaborationClientId ? `${id}_${collaborationClientId}` : id.toString()

// Generate the next ID in `context`
export const nextId = (context: ISiteContext): string => {
  const id = context.nextId
  context.nextId += 1
  return formatId(id)
}

// The ID `nextId` will return after `offset` further allocations, without allocating
export const peekNextId = (context: ISiteContext, offset = 0): string =>
  formatId(context.nextId + offset)

const latestId = (context: ISiteContext): string => formatId(context.nextId - 1)

export const behaviorId = (namespace: string, id: string | number): string => {
  return `${namespace}-b-${id}`
}

// Get the latest behavior ID in the namespace
export const latestBehaviorId = (context: ISiteContext): string => {
  return behaviorId(context.namespace, latestId(context))
}

export const nextBehaviorId = (context: ISiteContext) => {
  return behaviorId(context.namespace, nextId(context))
}

// Get the latest component ID in the namespace
export const latestComponentId = (context: ISiteContext): string => {
  return componentId(context.namespace, latestId(context))
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
  return styleId(context.namespace, latestId(context))
}

export const breakpointId = (namespace: string, id: string): string => {
  return `${namespace}-bp-${id}`
}

export const nextBreakpointId = (context: ISiteContext): string => {
  return breakpointId(context.namespace, nextId(context))
}
