import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'
import {
  BuildSubmenu,
  ComponentMenuCollapsible,
  ComponentTabState,
  CssPseudoClass,
  EditorMode,
  IComponent,
  IEditBehavior,
  IEditorContext,
  IEditSvg,
  IPage,
  ISite,
  StyleToolbarMenu,
  ThemeTab,
} from '@pubstudio/shared/type-site'
import { buildContentWindowInnerId } from '@pubstudio/frontend/feature-build'
import { nextTick } from 'vue'

const { siteStore } = useSiteSource()

export const setEditorMode = (editor: IEditorContext, mode: EditorMode) => {
  const prevMode = editor.mode
  editor.mode = mode
  if (mode !== prevMode) {
    siteStore.value.saveEditor(editor)
  }
}

export const toggleEditorMenu = (
  editor: IEditorContext | undefined,
  mode: EditorMode,
  show?: boolean,
) => {
  if (editor) {
    const isActive = editor.mode === mode
    if (show === undefined) {
      // Toggle menu
      const nextMode = isActive ? EditorMode.None : mode
      setEditorMode(editor, nextMode)
    } else if (show) {
      setEditorMode(editor, mode)
    } else if (isActive) {
      // Only hide if the menu is active
      // This logic can probably be simplified
      setEditorMode(editor, EditorMode.None)
    }
  }
}

export const setBuildSubmenu = (
  editor: IEditorContext | undefined,
  submenu: BuildSubmenu | undefined,
) => {
  if (editor) {
    const prevSubmenu = editor.buildSubmenu
    editor.buildSubmenu = submenu
    if (submenu !== prevSubmenu) {
      siteStore.value.saveEditor(editor)
    }
  }
}

export const setStyleToolbarMenu = (
  editor: IEditorContext | undefined,
  menu: StyleToolbarMenu | undefined,
) => {
  if (editor) {
    const prevMenu = editor.styleMenu
    editor.styleMenu = menu
    if (menu !== prevMenu) {
      siteStore.value.saveEditor(editor)
    }
  }
}

export interface ISetSelectedComponentOptions {
  /**
   * @default true
   */
  expandTree?: boolean
  /**
   * @default true
   */
  scrollToComponent?: boolean
}

export const setSelectedComponent = (
  site: ISite,
  component: IComponent | undefined,
  options?: ISetSelectedComponentOptions,
) => {
  const { editor } = site

  if (editor) {
    // Remember old state to see if we should save to local storage
    const prevComponent = editor.selectedComponent
    const prevMode = editor.mode

    editor.selectedComponent = component
    const isSelectMode = editor.mode === EditorMode.SelectedComponent
    const { expandTree = true, scrollToComponent = true } = options ?? {}
    if (component) {
      if (!isSelectMode) {
        editor.mode = EditorMode.SelectedComponent
      }
      if (expandTree) {
        expandComponentTreeItem(editor, component)
      }
      // Check for the type of `document` here because unit tests are run in Node environment
      // where `document` is not available. `document !== undefined` is not viable here because
      // that'll lead to "ReferenceError: window is not defined" error in Node environment.
      if (scrollToComponent && typeof document !== 'undefined') {
        // Switch to the target page before scrolling
        const componentPage = findComponentPage(site, component)
        if (!componentPage) {
          throw new Error(`Cannot find page for component with ID ${component.id}`)
        } else if (editor.active !== componentPage.route) {
          setActivePage(editor, componentPage.route)
        }

        // Scroll to the target element. Use `nextTick` to wait for the new component (element)
        // to be inserted to the DOM tree before scrolling.
        nextTick(() => {
          const buildContentWindow = document.getElementById(buildContentWindowInnerId)
          const element = document.getElementById(component.id)
          if (buildContentWindow && element) {
            // Use intersection observer to check if the target element is in the viewport.
            // Only scroll to the target element if it's outside of viewport for better UX.
            const intersectionObserver = new IntersectionObserver(
              // The callback of intersection observer will be executed immediately after setup.
              ([entry]) => {
                if (!entry.intersectionRatio) {
                  element.scrollIntoView()
                }
                intersectionObserver.disconnect()
              },
              {
                root: buildContentWindow,
              },
            )
            intersectionObserver.observe(element)
          }
        })
      }
    } else if (isSelectMode) {
      editor.mode = EditorMode.None
    }
    // Save editor state to local storage if anything changed
    if (editor.mode !== prevMode || component !== prevComponent) {
      clearComponentTabState(editor)
    }
  }
}

const findComponentPage = (site: ISite, component: IComponent): IPage | undefined => {
  let root = component
  while (root.parent) {
    root = root.parent
  }
  return Object.values(site.pages).find((page) => page.root.id === root.id)
}

export const clearComponentTabState = (editor: IEditorContext | undefined) => {
  if (editor) {
    editor.componentTab.state = undefined
    editor.componentTab.editEvent = undefined
    editor.componentTab.editInput = undefined
    editor.componentTab.editInputValue = undefined
    editor.componentTab.editStyle = undefined
    editor.componentTab.editInfo = undefined
    siteStore.value.saveEditor(editor)
  }
}

export const setComponentTabState = (
  editor: IEditorContext | undefined,
  state: ComponentTabState | undefined,
  save = true,
) => {
  const cmp = editor?.selectedComponent
  const changed = cmp && editor.componentTab?.state !== state
  if (changed) {
    editor.componentTab.state = state
    if (save) {
      siteStore.value.saveEditor(editor)
    }
  }
  return changed
}

export const setComponentTabEditInfo = (
  editor: IEditorContext | undefined,
  state: ComponentTabState | undefined,
  value: string | undefined,
) => {
  if (editor) {
    setComponentTabState(editor, state, false)
    if (value !== editor.componentTab.editInfo) {
      editor.componentTab.editInfo = value
      siteStore.value.saveEditor(editor)
    }
  }
}

export const setComponentEditStyle = (
  editor: IEditorContext | undefined,
  propName: string | undefined,
) => {
  const state = propName === undefined ? undefined : ComponentTabState.EditStyle
  if (editor) {
    const changed = setComponentTabState(editor, state, false)
    if (changed || editor.componentTab.editStyle !== propName) {
      editor.componentTab.editStyle = propName
      siteStore.value.saveEditor(editor)
    }
  }
}

export const setComponentEditEvent = (
  editor: IEditorContext | undefined,
  eventName: string | undefined,
) => {
  const state = eventName === undefined ? undefined : ComponentTabState.EditEvent
  if (editor) {
    const changed = setComponentTabState(editor, state, false)
    if (changed) {
      editor.componentTab.editEvent = eventName
      siteStore.value.saveEditor(editor)
    }
  }
}

export const setComponentEditInput = (
  editor: IEditorContext | undefined,
  inputName: string | undefined,
) => {
  const state = inputName === undefined ? undefined : ComponentTabState.EditInput
  if (editor) {
    const changed = setComponentTabState(editor, state, false)
    if (changed) {
      editor.componentTab.editInput = inputName
      siteStore.value.saveEditor(editor)
    }
  }
}

export const setComponentEditInputValue = (
  editor: IEditorContext | undefined,
  inputName: string | undefined,
) => {
  if (editor) {
    editor.componentTab.editInputValue = inputName
    siteStore.value.saveEditor(editor)
  }
}

export const setEditBehavior = (
  editor: IEditorContext | undefined,
  behavior: IEditBehavior | undefined,
) => {
  if (editor && behavior !== editor.editBehavior) {
    editor.editBehavior = behavior
    siteStore.value.saveEditor(editor)
  }
}

export const setEditSvg = (
  editor: IEditorContext | undefined,
  svg: IEditSvg | undefined,
) => {
  if (editor && svg !== editor.editSvg) {
    editor.editSvg = svg
    siteStore.value.saveEditor(editor)
  }
}

export const showTranslations = (editor: IEditorContext | undefined, show: boolean) => {
  if (editor && show !== editor.translations) {
    editor.translations = show
    siteStore.value.saveEditor(editor)
  }
}

export const setThemeTab = (editor: IEditorContext | undefined, tab: ThemeTab) => {
  if (editor && tab !== editor.themeTab) {
    editor.themeTab = tab
    siteStore.value.saveEditor(editor)
  }
}

export const setDebugBounding = (editor: IEditorContext | undefined, enable: boolean) => {
  if (editor) {
    editor.debugBounding = enable
    siteStore.value.saveEditor(editor)
  }
}

export const expandComponentTreeItem = (
  editor: IEditorContext | undefined,
  component: IComponent,
) => {
  const treeItems = editor?.componentTreeExpandedItems
  let changed = false
  let currentComponent: IComponent | undefined = component
  if (treeItems) {
    // Expand component and ancestors
    while (currentComponent) {
      changed = changed || !treeItems[currentComponent.id]

      treeItems[currentComponent.id] = true
      currentComponent = currentComponent.parent
    }
    if (editor && changed) {
      siteStore.value.saveEditor(editor)
    }
  }
}

export const collapseComponentTreeItem = (
  editor: IEditorContext | undefined,
  component: IComponent,
) => {
  const treeItems = editor?.componentTreeExpandedItems
  if (treeItems) {
    const prevExpanded = treeItems[component.id]
    treeItems[component.id] = false
    if (editor && prevExpanded) {
      siteStore.value.saveEditor(editor)
    }
  }
}

export const toggleComponentHidden = (
  editor: IEditorContext | undefined,
  componentId: string,
) => {
  if (editor) {
    if (editor.componentsHidden[componentId]) {
      delete editor.componentsHidden[componentId]
    } else {
      editor.componentsHidden[componentId] = true
    }
  }
}

export const getComponentTreeItemId = (component: IComponent) => `cti-${component.id}`

export const setShowComponentTree = (
  editor: IEditorContext | undefined,
  showComponentTree: boolean,
) => {
  if (editor) {
    const prevValue = editor.showComponentTree
    if (prevValue !== showComponentTree) {
      editor.showComponentTree = showComponentTree
      siteStore.value.saveEditor(editor)
    }
  }
}

export const setActivePage = (editor: IEditorContext | undefined, pageRoute: string) => {
  if (editor) {
    editor.active = pageRoute
    if (editor.buildSubmenu === BuildSubmenu.Page) {
      editor.buildSubmenu = undefined
    }
    siteStore.value.saveEditor(editor)
  }
}

// Builder scale will be updated based on the given width
export const setBuilderWidth = (editor: IEditorContext | undefined, width: number) => {
  if (editor) {
    editor.builderWidth = width
    if (width > runtimeContext.buildContentWindowSize.value.width) {
      editor.builderScale =
        Math.round((runtimeContext.buildContentWindowSize.value.width / width) * 100) /
        100
    } else {
      editor.builderScale = 1
    }
    siteStore.value.saveEditor(editor)
  }
}

// Builder width will be updated based on the given scale
export const setBuilderScale = (editor: IEditorContext | undefined, scale: number) => {
  if (editor) {
    editor.builderScale = scale
    editor.builderWidth = Math.round(
      runtimeContext.buildContentWindowSize.value.width / scale,
    )
    siteStore.value.saveEditor(editor)
  }
}

export const selectColor = (
  editor: IEditorContext | undefined,
  themeVariableId: string,
) => {
  if (editor) {
    if (editor.selectedThemeColors.has(themeVariableId)) {
      throw new Error(
        `Theme variable ${themeVariableId} is already in selectedThemeColors`,
      )
    }
    editor.selectedThemeColors.add(themeVariableId)
    siteStore.value.saveEditor(editor)
  }
}

export const unselectColor = (
  editor: IEditorContext | undefined,
  themeVariableId: string,
) => {
  if (editor) {
    if (!editor.selectedThemeColors.has(themeVariableId)) {
      throw new Error(`Theme variable ${themeVariableId} is not in selectedThemeColors`)
    }
    editor.selectedThemeColors.delete(themeVariableId)
    siteStore.value.saveEditor(editor)
  }
}

export const setCssPseudoClass = (
  editor: IEditorContext | undefined,
  pseudoClass: CssPseudoClass,
) => {
  if (editor) {
    editor.cssPseudoClass = pseudoClass
    siteStore.value.saveEditor(editor)
  }
}

export const setTemplatesShown = (editor: IEditorContext | undefined, shown: boolean) => {
  if (editor) {
    editor.templatesShown = shown
    siteStore.value.saveEditor(editor)
  }
}

export const getProseMirrorContainerId = (component: IComponent) =>
  `${component.id}-pm-container`

export const setComponentMenuCollapses = (
  editor: IEditorContext | undefined,
  collapsible: ComponentMenuCollapsible,
  collapsed: boolean,
) => {
  if (editor) {
    editor.componentMenuCollapses[collapsible] = collapsed
    siteStore.value.saveEditor(editor)
  }
}
