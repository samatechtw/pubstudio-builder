import { runtimeContext } from '@pubstudio/frontend/util-runtime'
import {
  BuildSubmenu,
  ComponentMenuCollapsible,
  ComponentTabState,
  ContactFormWalkthroughState,
  CssPseudoClass,
  EditorDropdown,
  EditorMode,
  IComponent,
  IEditBehavior,
  IEditingMixinData,
  IEditorContext,
  IEditSvg,
  ThemeTab,
} from '@pubstudio/shared/type-site'

const setEditorMode = (editor: IEditorContext, mode: EditorMode) => {
  const prevMode = editor.mode
  editor.mode = mode
  if (mode !== prevMode) {
    editor.store?.saveEditor(editor)
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
      editor.store?.saveEditor(editor)
    }
  }
}

export const setEditorDropdown = (
  editor: IEditorContext | undefined,
  menu: EditorDropdown | undefined,
) => {
  if (editor) {
    const prevMenu = editor.editorDropdown
    editor.editorDropdown = menu
    if (menu !== prevMenu) {
      editor.store?.saveEditor(editor)
    }
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
      editor.store?.saveEditor(editor)
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
      editor.store?.saveEditor(editor)
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
      editor.store?.saveEditor(editor)
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
      editor.store?.saveEditor(editor)
    }
  }
}

export const setComponentEditInputValue = (
  editor: IEditorContext | undefined,
  inputName: string | undefined,
) => {
  if (editor) {
    editor.componentTab.editInputValue = inputName
    editor.store?.saveEditor(editor)
  }
}

export const setEditBehavior = (
  editor: IEditorContext | undefined,
  behavior: IEditBehavior | undefined,
) => {
  if (editor && behavior !== editor.editBehavior) {
    editor.editBehavior = behavior
    editor.store?.saveEditor(editor)
  }
}

export const setEditSvg = (
  editor: IEditorContext | undefined,
  svg: IEditSvg | undefined,
) => {
  if (editor && svg !== editor.editSvg) {
    editor.editSvg = svg
    editor.store?.saveEditor(editor)
  }
}

export const showTranslations = (editor: IEditorContext | undefined, show: boolean) => {
  if (editor && show !== editor.translations) {
    editor.translations = show
    editor.store?.saveEditor(editor)
  }
}

export const setThemeTab = (editor: IEditorContext | undefined, tab: ThemeTab) => {
  if (editor && tab !== editor.themeTab) {
    editor.themeTab = tab
    editor.store?.saveEditor(editor)
  }
}

export const setDebugBounding = (editor: IEditorContext | undefined, enable: boolean) => {
  if (editor) {
    editor.debugBounding = enable
    editor.store?.saveEditor(editor)
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
      editor.store?.saveEditor(editor)
    }
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
    editor.store?.saveEditor(editor)
  }
}

// Builder width will be updated based on the given scale
export const setBuilderScale = (editor: IEditorContext | undefined, scale: number) => {
  if (editor) {
    editor.builderScale = scale
    editor.builderWidth = Math.round(
      runtimeContext.buildContentWindowSize.value.width / scale,
    )
    editor.store?.saveEditor(editor)
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
    editor.store?.saveEditor(editor)
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
    editor.store?.saveEditor(editor)
  }
}

export const setCssPseudoClass = (
  editor: IEditorContext | undefined,
  pseudoClass: CssPseudoClass,
) => {
  if (editor) {
    editor.cssPseudoClass = pseudoClass
    editor.store?.saveEditor(editor)
  }
}

export const setContactFormWalkthrough = (
  editor: IEditorContext | undefined,
  state: ContactFormWalkthroughState | undefined,
  formId?: string,
) => {
  if (editor) {
    if (editor?.contactFormWalkthrough) {
      if (state) {
        editor.contactFormWalkthrough.state = state
      } else {
        editor.contactFormWalkthrough = undefined
      }
    } else if (state && formId) {
      editor.contactFormWalkthrough = { state, formId }
    }
    editor.store?.saveEditor(editor)
  }
}

export const setTemplatesShown = (editor: IEditorContext | undefined, shown: boolean) => {
  if (editor) {
    editor.templatesShown = shown
    editor.store?.saveEditor(editor)
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
    editor.store?.saveEditor(editor)
  }
}

export const setEditingMixinData = (
  editor: IEditorContext | undefined,
  editingMixinData: IEditingMixinData | undefined,
) => {
  const prevData = editor?.editingMixinData
  if (
    editor &&
    (prevData?.mixinId !== editingMixinData?.mixinId ||
      prevData?.originComponentId !== editingMixinData?.originComponentId)
  ) {
    editor.editingMixinData = editingMixinData
    editor.store?.saveEditor(editor)
  }
}
