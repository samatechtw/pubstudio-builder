import {
  IComponent,
  IEditorContext,
  IPage,
  ISerializedComponent,
  ISerializedEditorContext,
  ISerializedPage,
  ISerializedSite,
  ISite,
  ISiteContext,
  IStoredSite,
} from '@pubstudio/shared/type-site'

interface IDeserializePagesResult {
  pages: Record<string, IPage>
  components: Record<string, IComponent>
}

export const deserializeEditor = (
  context: ISiteContext,
  serializedEditor: ISerializedEditorContext | undefined | null,
): IEditorContext | undefined => {
  const selectedId = serializedEditor?.selectedComponentId
  const editor = serializedEditor
    ? {
        selectedComponent: selectedId ? context.components[selectedId] : undefined,
        active: serializedEditor.active,
        editorEvents: serializedEditor.editorEvents ?? {},
        debugBounding: serializedEditor.debugBounding,
        buildSubmenu: serializedEditor.buildSubmenu,
        styleMenu: serializedEditor.styleMenu,
        editBehavior: serializedEditor.editBehavior,
        translations: serializedEditor.translations,
        themeTab: serializedEditor.themeTab,
        componentTab: serializedEditor.componentTab ?? {},
        mode: serializedEditor.mode,
        showComponentTree: serializedEditor.showComponentTree,
        componentTreeExpandedItems: serializedEditor.componentTreeExpandedItems,
        // Added 231125
        componentsHidden: serializedEditor.componentsHidden ?? {},
        selectedThemeColors: new Set(serializedEditor.selectedThemeColors),
        builderWidth: serializedEditor.builderWidth,
        builderScale: serializedEditor.builderScale,
        cssPseudoClass: serializedEditor.cssPseudoClass,
        templatesShown: serializedEditor.templatesShown,
        // Added 231201
        componentMenuCollapses: serializedEditor.componentMenuCollapses ?? {},
      }
    : undefined

  return editor
}

const deserializeComponent = (ser: ISerializedComponent): IComponent => {
  return {
    id: ser.id,
    name: ser.name,
    tag: ser.tag,
    role: ser.role,
    content: ser.content,
    parent: undefined,
    children: undefined,
    style: ser.style,
    state: ser.state,
    inputs: ser.inputs,
    events: ser.events,
    editorEvents: ser.editorEvents,
  }
}

export const deserializePages = (
  serializedPages: Record<string, ISerializedPage>,
): IDeserializePagesResult => {
  const pages: Record<string, IPage> = {}
  const components: Record<string, IComponent> = {}
  // First, generate the component cache width empty parent/children
  for (const [name, page] of Object.entries(serializedPages)) {
    // Set up the page with root
    const root = deserializeComponent(page.root)
    components[root.id] = root
    pages[name] = {
      name: page.name,
      route: page.route,
      root,
      public: page.public,
      head: page.head,
    }
    let queue = [...(page.root.children ?? [])]
    for (;;) {
      const cur = queue.shift()
      if (!cur) break
      components[cur.id] = deserializeComponent(cur)
      queue.push(...(cur.children ?? []))
    }
    // Fill in the parent and children relationships
    queue = [page.root]
    for (;;) {
      const cur = queue.shift()
      if (!cur) break
      const c = components[cur.id]
      c.parent = cur.parentId ? components[cur.parentId] : undefined
      c.children = cur.children?.map((child) => components[child.id])
      queue.push(...(cur.children ?? []))
    }
  }
  return { pages, components }
}

export const deserializedHelper = (serialized: ISerializedSite): ISite => {
  const { context, defaults, editor, history } = serialized
  const { pages, components } = deserializePages(serialized.pages)
  const siteContext: ISiteContext = {
    namespace: context.namespace,
    nextId: context.nextId,
    components,
    behaviors: context.behaviors,
    styles: context.styles,
    theme: context.theme,
    breakpoints: context.breakpoints,
    // Added 231105
    i18n: context.i18n ?? {},
    activeI18n: context.activeI18n,
  }
  const site: ISite = {
    context: siteContext,
    name: serialized.name,
    version: serialized.version,
    defaults,
    pages,
    editor: deserializeEditor(siteContext, editor),
    history: { back: history.back, forward: history.forward },
    updated_at: serialized.updated_at,
  }
  return site
}

export const deserializeSite = (serializedSite: string): ISite | undefined => {
  try {
    const serialized: ISerializedSite = JSON.parse(serializedSite)
    const site = deserializedHelper(serialized)
    return site
  } catch (e) {
    console.log('Deserialization error', e)
    return undefined
  }
}

export const storedToSerializedSite = (
  stored: IStoredSite,
): ISerializedSite | undefined => {
  const { name, version, defaults, context, pages, editor, history } = stored
  if (!(name && version && defaults && context && pages)) {
    return undefined
  }
  const serialized: ISerializedSite = {
    name,
    version,
    defaults: JSON.parse(defaults),
    context: JSON.parse(context),
    pages: JSON.parse(pages),
    editor: editor ? JSON.parse(editor) : undefined,
    history: history
      ? JSON.parse(history)
      : {
          back: [],
          forward: [],
        },
    updated_at: stored.updated_at || undefined,
  }
  return serialized
}

export const unstoreSite = (stored: IStoredSite): ISite | undefined => {
  const serialized = storedToSerializedSite(stored)
  return serialized ? deserializedHelper(serialized) : undefined
}
