import {
  IComponent,
  IEditorContext,
  IPage,
  ISerializedComponent,
  ISerializedEditorContext,
  ISerializedPage,
  ISerializedSite,
  ISerializedSiteContext,
  ISite,
  ISiteContext,
  IStoredSite,
} from '@pubstudio/shared/type-site'

export const serializeComponent = (component: IComponent): ISerializedComponent => {
  return {
    id: component.id,
    name: component.name,
    tag: component.tag,
    role: component.role,
    content: component.content,
    parentId: component.parent?.id,
    children: component.children?.map((c) => serializeComponent(c)),
    style: component.style,
    state: component.state,
    inputs: component.inputs,
    events: component.events,
    editorEvents: component.editorEvents,
    customSourceId: component.customSourceId,
  }
}

export const serializePage = (page: IPage): ISerializedPage => {
  return {
    ...page,
    root: serializeComponent(page.root),
  }
}

export const serializeEditor = (
  editor: IEditorContext | undefined,
): ISerializedEditorContext | undefined => {
  return editor
    ? {
        selectedComponentId: editor.selectedComponent?.id,
        active: editor.active,
        debugBounding: editor.debugBounding,
        buildSubmenu: editor.buildSubmenu,
        editorDropdown: editor.editorDropdown,
        editBehavior: editor.editBehavior,
        translations: editor.translations,
        themeTab: editor.themeTab,
        styleTab: editor.styleTab,
        editGlobalStyle: editor.editGlobalStyle,
        componentTab: editor.componentTab,
        mode: editor.mode,
        editPageRoute: editor.editPageRoute,
        showComponentTree: editor.showComponentTree,
        componentTreeExpandedItems: editor.componentTreeExpandedItems,
        componentsHidden: editor.componentsHidden,
        selectedThemeColors: Array.from(editor.selectedThemeColors),
        editingMixinData: editor.editingMixinData,
        builderWidth: editor.builderWidth,
        builderScale: editor.builderScale,
        cssPseudoClass: editor.cssPseudoClass,
        hotkeys: editor.hotkeys,
        templatesShown: editor.templatesShown,
        componentMenuCollapses: editor.componentMenuCollapses,
        contactFormWalkthrough: editor.contactFormWalkthrough,
        mailingListWalkthrough: editor.mailingListWalkthrough,
      }
    : undefined
}

export const serializeSiteContext = (context: ISiteContext): ISerializedSiteContext => {
  return {
    namespace: context.namespace,
    nextId: context.nextId,
    styles: context.styles,
    styleOrder: context.styleOrder,
    customComponentIds: Array.from(context.customComponentIds),
    customChildIds: Array.from(context.customChildIds),
    behaviors: context.behaviors,
    theme: context.theme,
    breakpoints: context.breakpoints,
    i18n: context.i18n,
    activeI18n: context.activeI18n,
    globalStyles: context.globalStyles,
  }
}

export const serializeSite = (site: ISite): ISerializedSite => {
  const { context, history } = site
  const pages: Record<string, ISerializedPage> = {}
  for (const key in site.pages) {
    pages[key] = serializePage(site.pages[key])
  }
  const serialized: ISerializedSite = {
    name: site.name,
    version: site.version,
    context: serializeSiteContext(context),
    defaults: site.defaults,
    pages,
    pageOrder: site.pageOrder,
    editor: serializeEditor(site.editor),
    history,
  }
  return serialized
}

export const storeSite = (site: ISite): IStoredSite => {
  const serialized = serializeSite(site)
  return {
    name: serialized.name,
    version: serialized.version,
    defaults: JSON.stringify(serialized.defaults),
    context: JSON.stringify(serialized.context),
    pages: JSON.stringify(serialized.pages),
    pageOrder: JSON.stringify(serialized.pageOrder),
    editor: JSON.stringify(serialized.editor),
    history: JSON.stringify(serialized.history),
    updated_at: serialized.updated_at,
    content_updated_at: serialized.content_updated_at,
  }
}

export const stringifySite = (site: ISite, pretty = false): string => {
  const serialized = serializeSite(site)
  if (pretty) {
    return JSON.stringify(serialized, null, 2)
  }
  return JSON.stringify(serialized)
}
