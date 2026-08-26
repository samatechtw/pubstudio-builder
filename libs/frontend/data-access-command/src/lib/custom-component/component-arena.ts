import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import {
  ARENA_ROOT_ID,
  ARENA_SLOT_ID,
  arenaComponentId,
  isArenaId,
  isCustomComponentPart,
  iterateComponent,
} from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeCustomComponents } from '@pubstudio/frontend/util-site-deserialize'
import { serializeComponent } from '@pubstudio/frontend/util-site-store'
import {
  IComponent,
  IPage,
  ISerializedComponent,
  ISite,
  ISiteContext,
  Tag,
} from '@pubstudio/shared/type-site'
import {
  registerComponentEditorEvents,
  removeEditorEvents,
} from '../editor-event-handlers'
import { setSelectedComponent } from '../set-selected-component'

// A definition is edited in a synthetic page so the ordinary builder canvas, tree,
// style menus and undo stack all work on it. Everything in the arena besides the
// definition is editor-only scaffolding, stored in `editor.componentArenas`.
export const ARENA_ROUTE = '__component__'
export { ARENA_ROOT_ID, ARENA_SLOT_ID }

const arenaIdCounters = new WeakMap<ISiteContext, number>()

export const nextArenaId = (context: ISiteContext): string => {
  let n = arenaIdCounters.get(context) ?? 0
  while (context.components[arenaComponentId(n)]) {
    n += 1
  }
  arenaIdCounters.set(context, n + 1)
  return arenaComponentId(n)
}

const defaultArena = (): ISerializedComponent => ({
  id: ARENA_ROOT_ID,
  name: 'Arena',
  tag: Tag.Div,
  style: {
    custom: {
      [DEFAULT_BREAKPOINT_ID]: {
        default: {
          width: '100%',
          'min-height': '100%',
          display: 'flex',
          'flex-direction': 'column',
          'align-items': 'stretch',
          padding: '40px',
          'background-color': '#f4f4f5',
        },
      },
    },
  },
  children: [
    { id: ARENA_SLOT_ID, name: 'Component', tag: Tag.Div, style: { custom: {} } },
  ],
})

export const isArenaComponent = (component: IComponent | undefined): boolean => {
  let cmp = component
  while (cmp) {
    if (cmp.id === ARENA_ROOT_ID) {
      return true
    }
    cmp = cmp.parent
  }
  return false
}

// Inside the arena, but not part of the definition being edited
export const isArenaScaffolding = (site: ISite, component: IComponent): boolean => {
  if (!site.editor?.editingComponentId || !isArenaComponent(component)) {
    return false
  }
  let cmp: IComponent | undefined = component
  while (cmp) {
    if (cmp.id === site.editor.editingComponentId) {
      return false
    }
    cmp = cmp.parent
  }
  return true
}

const LEGACY_ARENA_ROOT_ID = 'arena-c-root'
const LEGACY_ARENA_SLOT_ID = 'arena-c-slot'

// Renumber legacy scaffolding before materialization so it cannot overwrite a site node
// whose id was reclaimed by undo.
const withArenaIds = (
  context: ISiteContext,
  root: ISerializedComponent,
): ISerializedComponent => {
  const ids = new Set(Object.keys(context.components).filter(isArenaId))
  const renamed = new Map<string, string>()
  let next = 0
  const allocate = () => {
    let id = arenaComponentId(next)
    while (ids.has(id)) {
      next += 1
      id = arenaComponentId(next)
    }
    ids.add(id)
    next += 1
    return id
  }

  const collect = (node: ISerializedComponent, isRoot = false) => {
    let id: string
    if (isRoot || node.id === LEGACY_ARENA_ROOT_ID) {
      id = ARENA_ROOT_ID
    } else if (node.id === LEGACY_ARENA_SLOT_ID || node.id === ARENA_SLOT_ID) {
      id = ARENA_SLOT_ID
    } else if (isArenaId(node.id) && !ids.has(node.id)) {
      id = node.id
      ids.add(id)
    } else {
      id = allocate()
    }
    renamed.set(node.id, id)
    node.children?.forEach((child) => collect(child))
  }
  collect(root, true)

  const rename = (id: string): string => renamed.get(id) ?? id
  const convert = (node: ISerializedComponent): ISerializedComponent => {
    const overrides = node.style?.overrides
    return {
      ...node,
      id: rename(node.id),
      parentId: node.parentId ? rename(node.parentId) : undefined,
      style: overrides
        ? {
            ...node.style,
            overrides: Object.fromEntries(
              Object.entries(overrides).map(([id, style]) => [
                node.customSourceId ? id : rename(id),
                style,
              ]),
            ),
          }
        : node.style,
      children: node.children?.map(convert),
    }
  }
  return convert(root)
}

const buildArena = (site: ISite, definition: IComponent) => {
  const { context, editor } = site
  arenaIdCounters.delete(context)
  const stored = withArenaIds(
    context,
    editor?.componentArenas?.[definition.id] ?? defaultArena(),
  )
  deserializeCustomComponents([stored], context.components)
  const slot = context.components[ARENA_SLOT_ID]
  const parent = slot?.parent ?? context.components[ARENA_ROOT_ID]
  const index = parent?.children?.findIndex((c) => c.id === ARENA_SLOT_ID) ?? 0
  if (parent) {
    definition.parent = parent
    parent.children = [...(parent.children ?? [])]
    if (index >= 0) {
      parent.children.splice(index, 1, definition)
    } else {
      parent.children.push(definition)
    }
  }
  delete context.components[ARENA_SLOT_ID]
  iterateComponent(context.components[ARENA_ROOT_ID], (cmp) => {
    if (cmp.id !== definition.id) {
      registerComponentEditorEvents(site, cmp)
    }
  })
}

// The definition is swapped for a slot placeholder recording where it mounts. This runs
// on every save, so it must not touch the live tree; mutating `children` here would
// re-render the canvas mid-edit.
const serializeArenaNode = (
  node: IComponent,
  definitionId: string,
): ISerializedComponent => {
  if (node.id === definitionId) {
    return {
      id: ARENA_SLOT_ID,
      name: 'Component',
      tag: Tag.Div,
      parentId: node.parent?.id,
      style: { custom: {} },
    }
  }
  return {
    ...serializeComponent({ ...node, children: undefined }),
    children: node.children?.map((child) => serializeArenaNode(child, definitionId)),
  }
}

// Only writes when the arena actually changed — a reactive write on every save
// re-renders the canvas and steals focus from whatever is being edited.
export const snapshotArena = (site: ISite) => {
  const { editor } = site
  const definitionId = editor?.editingComponentId
  const root = definitionId ? site.context.components[ARENA_ROOT_ID] : undefined
  if (!editor || !definitionId || !root) {
    return
  }
  const arena = serializeArenaNode(root, definitionId)
  const current = editor.componentArenas?.[definitionId]
  if (current && JSON.stringify(current) === JSON.stringify(arena)) {
    return
  }
  editor.componentArenas = { ...editor.componentArenas, [definitionId]: arena }
}

export const removeStoredArena = (
  site: ISite,
  definitionId: string,
): ISerializedComponent | undefined => {
  const arenas = site.editor?.componentArenas
  const arena = arenas?.[definitionId]
  if (site.editor && arena) {
    const remaining = { ...arenas }
    delete remaining[definitionId]
    site.editor.componentArenas = remaining
  }
  return arena
}

export const restoreStoredArena = (
  site: ISite,
  definitionId: string,
  arena: ISerializedComponent | undefined,
) => {
  if (site.editor && arena) {
    site.editor.componentArenas = {
      ...site.editor.componentArenas,
      [definitionId]: arena,
    }
  }
}

// Anything in a definition or the arena is off the canvas once the edit screen closes,
// so a stale selection there is dropped rather than restored.
const returnSelection = (
  site: ISite,
  returnId: string | undefined,
): IComponent | undefined => {
  const component = returnId ? site.context.components[returnId] : undefined
  if (
    !component ||
    isArenaComponent(component) ||
    isCustomComponentPart(site.context, component)
  ) {
    return undefined
  }
  return component
}

const clearArena = (site: ISite) => {
  const { context, editor } = site
  const root = context.components[ARENA_ROOT_ID]
  const remove = (component: IComponent) => {
    component.children?.forEach(remove)
    delete context.components[component.id]
    removeEditorEvents(site, component)
    if (editor?.componentTreeExpandedItems) {
      delete editor.componentTreeExpandedItems[component.id]
    }
    if (editor?.componentsHidden) {
      delete editor.componentsHidden[component.id]
    }
  }
  if (root) {
    remove(root)
  }
  arenaIdCounters.delete(context)
}

export const exitComponentEdit = (site: ISite) => {
  const definitionId = site.editor?.editingComponentId
  if (!site.editor || !definitionId) {
    return
  }
  snapshotArena(site)
  const definition = site.context.components[definitionId]
  const parent = definition?.parent
  if (parent?.children) {
    parent.children = parent.children.filter((c) => c.id !== definitionId)
    if (!parent.children.length) {
      parent.children = undefined
    }
  }
  if (definition) {
    definition.parent = undefined
  }
  clearArena(site)
  site.editor.editingComponentId = undefined
  const returnId = site.editor.componentEditReturnId
  site.editor.componentEditReturnId = undefined
  setSelectedComponent(site, returnSelection(site, returnId))
  site.editor.store?.saveEditor(site.editor)
}

export const enterComponentEdit = (site: ISite, definitionId: string) => {
  const { editor } = site
  const definition = resolveComponent(site.context, definitionId)
  if (!editor || !definition || !site.context.customComponentIds.has(definitionId)) {
    return
  }
  if (editor.editingComponentId) {
    exitComponentEdit(site)
  }
  editor.componentEditReturnId = editor.selectedComponent?.id
  buildArena(site, definition)
  editor.editingComponentId = definitionId
  editor.componentTreeExpandedItems = {
    ...editor.componentTreeExpandedItems,
    [ARENA_ROOT_ID]: true,
    [definitionId]: true,
  }
  setSelectedComponent(site, definition)
  editor.store?.saveEditor(editor)
}

export const arenaPage = (site: ISite): IPage | undefined => {
  const root = site.context.components[ARENA_ROOT_ID]
  if (!site.editor?.editingComponentId || !root) {
    return undefined
  }
  return { name: 'Component', route: ARENA_ROUTE, root, public: false, head: {} }
}

export const activeCanvasPage = (site: ISite): IPage | undefined => {
  const arena = arenaPage(site)
  const route = site.editor?.active ?? site.defaults.homePage
  return arena ?? site.pages[route]
}

export const activeCanvasRoute = (site: ISite): string =>
  activeCanvasPage(site)?.route ?? site.editor?.active ?? site.defaults.homePage
