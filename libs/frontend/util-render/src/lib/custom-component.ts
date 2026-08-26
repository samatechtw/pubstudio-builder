import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IComponent, IInstanceOverrides, ISiteContext } from '@pubstudio/shared/type-site'

// Joins the expansion path: `<instanceId>_<defChildId>[_<defGrandchildId>…]`.
// Real component ids are `<namespace>-c-<n>`, so `_` cannot appear in one.
export const EXPANDED_ID_SEPARATOR = '_'

// True for a definition root or any of its descendants
export const isCustomComponentPart = (
  context: ISiteContext,
  component: IComponent | undefined,
): boolean => {
  let cmp = component
  while (cmp) {
    if (context.customComponentIds.has(cmp.id)) {
      return true
    }
    cmp = cmp.parent
  }
  return false
}

// Expanded children are synthesized at render time and never enter `context.components`
export const isExpandedId = (context: ISiteContext, componentId: string): boolean =>
  componentId.includes(EXPANDED_ID_SEPARATOR) && !context.components[componentId]

export const expandedInstanceId = (
  context: ISiteContext,
  componentId: string | undefined,
): string | undefined => {
  if (!componentId || !isExpandedId(context, componentId)) {
    return undefined
  }
  const instanceId = componentId.split(EXPANDED_ID_SEPARATOR)[0]
  return context.components[instanceId] ? instanceId : undefined
}

// Definition descendant an expanded child stands for: the last segment of the path
export const expandedChildId = (componentId: string): string =>
  componentId.split(EXPANDED_ID_SEPARATOR).pop() as string

// `seen` guards against a definition that instantiates itself
const definitionChildren = (
  context: ISiteContext,
  node: IComponent,
  seen: Set<string>,
): { children: IComponent[]; seen: Set<string> } | undefined => {
  if (node.children?.length) {
    return { children: node.children, seen }
  }
  const sourceId = node.customSourceId
  if (!sourceId || seen.has(sourceId)) {
    return undefined
  }
  const source = resolveComponent(context, sourceId)
  if (!source?.children?.length) {
    return undefined
  }
  return { children: source.children, seen: new Set(seen).add(sourceId) }
}

// A stand-in behaves like a stored component whose `customSourceId` is the definition
// child, so content, inputs, events and the `.defChildId` class are inherited unchanged.
const expandChild = (
  context: ISiteContext,
  host: IComponent,
  def: IComponent,
  overrides: IInstanceOverrides | undefined,
  seen: Set<string>,
): IComponent => {
  const override = overrides?.[def.id]
  const expanded: IComponent = {
    id: `${host.id}${EXPANDED_ID_SEPARATOR}${def.id}`,
    name: def.name,
    tag: def.tag,
    role: def.role,
    parent: host,
    content: override?.content,
    inputs: override?.inputs,
    customSourceId: def.id,
    state: def.state,
    // A definition child that is itself an instance keeps the nested definition's shared
    // style class; the child's own mixins are already merged into `.defChildId`.
    style: def.customSourceId
      ? { custom: {}, mixins: [def.customSourceId] }
      : { custom: {} },
  }
  const nested = definitionChildren(context, def, seen)
  expanded.children = nested?.children.map((child) =>
    expandChild(context, expanded, child, overrides, nested.seen),
  )
  return expanded
}

export const renderChildren = (
  context: ISiteContext,
  component: IComponent,
): IComponent[] | undefined => {
  if (component.children?.length) {
    return component.children
  }
  const expansion = definitionChildren(context, component, new Set())
  return expansion?.children.map((child) =>
    expandChild(context, component, child, component.instanceOverrides, expansion.seen),
  )
}

// Child style override selectors, emitted as `.componentId .childId`. An instance offers
// the whole definition subtree it expands, since those nodes are not selectable on canvas.
export const overrideSelectorIds = (
  context: ISiteContext,
  component: IComponent,
): string[] => {
  if (component.children?.length) {
    return component.children.map((child) => child.id)
  }
  const ids: string[] = []
  const walk = (node: IComponent, seen: Set<string>) => {
    const expansion = definitionChildren(context, node, seen)
    for (const child of expansion?.children ?? []) {
      ids.push(child.id)
      walk(child, expansion?.seen ?? seen)
    }
  }
  walk(component, new Set())
  return ids
}

// Generated component ids always contain `-c-`; this form cannot collide with one.
export const ARENA_ID_PREFIX = '__arena_'
export const ARENA_ROOT_ID = `${ARENA_ID_PREFIX}root`
export const ARENA_SLOT_ID = `${ARENA_ID_PREFIX}slot`

const arenaIdPattern = /^__arena_(?:\d+|root|slot)$/

export const arenaComponentId = (id: number): string => `${ARENA_ID_PREFIX}${id}`

export const isArenaId = (componentId: string | undefined): boolean =>
  !!componentId && arenaIdPattern.test(componentId)
