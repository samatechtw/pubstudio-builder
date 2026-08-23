import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { isCustomComponentPart, iterateComponent } from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeCustomComponents } from '@pubstudio/frontend/util-site-deserialize'
import { serializeComponent } from '@pubstudio/frontend/util-site-store'
import {
  IComponent,
  IPage,
  ISerializedComponent,
  ISite,
  Tag,
} from '@pubstudio/shared/type-site'
import { registerComponentEditorEvents } from '../editor-event-handlers'
import { setSelectedComponent } from '../set-selected-component'

// A definition is edited in a synthetic page so the ordinary builder canvas, tree,
// style menus and undo stack all work on it. Everything in the arena besides the
// definition is editor-only scaffolding, stored in `editor.componentArenas`.
export const ARENA_ROUTE = '__component__'
export const ARENA_ROOT_ID = 'arena-c-root'
export const ARENA_SLOT_ID = 'arena-c-slot'

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

const buildArena = (site: ISite, definition: IComponent) => {
  const { context, editor } = site
  const stored = editor?.componentArenas?.[definition.id] ?? defaultArena()
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
