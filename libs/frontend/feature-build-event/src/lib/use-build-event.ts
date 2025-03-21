import {
  clearComponentTabState,
  editingCommandCount,
  isEditingStyles,
  setBuildSubmenu,
  setEditorDropdown,
  toggleEditorMenu,
} from '@pubstudio/frontend/data-access-command'
import {
  useBuild,
  useCopyPaste,
  useDuplicateComponent,
  useHistory,
  useMixinMenuUi,
  usePaddingMarginEdit,
} from '@pubstudio/frontend/feature-build'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { builderContext } from '@pubstudio/frontend/util-builder'
import { resolvedComponentStyle } from '@pubstudio/frontend/util-component'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import {
  BuildSubmenu,
  Css,
  CssPseudoClass,
  CssUnit,
  EditorMode,
  IStyleEntry,
  Keys,
} from '@pubstudio/shared/type-site'
import { onMounted, onUnmounted } from 'vue'
import {
  selectComponent,
  selectNextComponent,
  selectPreviousComponent,
} from './select-component'
import { triggerHotkey } from './trigger-hotkey'
import { hotkeysDisabled, prosemirrorActive } from './util-build-event'
import {
  calcNextHeight,
  calcNextWidth,
  getHeightPxPerPercent,
  getWidthPxPerPercent,
  isLengthValue,
} from './util-resize'

const clickEventType = document.ontouchstart !== null ? 'click' : 'touchend'

const isRenderer = (target: HTMLElement | undefined): boolean => {
  return !!target?.closest('.build-content')
}
const findClickedComponentTreeItemId = (
  target: HTMLElement | undefined,
): string | undefined => {
  const componentTreeItem = target?.closest('.component-tree-item')
  if (componentTreeItem) {
    return componentTreeItem.id
  } else {
    // Convert tag name to lowercase because the casing is different in HTML & XML/XHTML.
    const tagName = target?.tagName?.toLowerCase()

    // When the eye button in a component tree item is clicked, the editor will scroll to
    // the corresponding component, so the "press enter to rename" feature should also
    // work. We use `element.closest` to find the corresponding tree item when click event
    // happens, but `element.closest` does not work on <svg> and <path> (their parentElements
    // will always be null). Thus, we have to add dataset on the eye buttons (<svg>) to store
    // tree item id for retrieving later.
    // Also, when a component is being renamed in the tree, clicking the rename input should not
    // lose the renaming state (click on the rename input should not be considered as clicking outside).
    // So we have to add dataset on the rename input to store tree item id for retrieving later as well.
    let element: HTMLElement | undefined | null
    if (tagName === 'svg' || tagName === 'input') {
      element = target
    } else if (tagName === 'path') {
      element = (target as HTMLElement).parentElement
    }
    return element?.dataset.treeItemId
  }
}
const isProseMirrorLink = (target: HTMLElement | undefined): boolean => {
  return !!target?.closest('a') && !!target?.closest('.pm-p')
}
const isBuildMenu = (target: HTMLElement | undefined): boolean => {
  return !!target?.closest('.build-menu')
}
const isBuildRightMenu = (target: HTMLElement | undefined): boolean => {
  return !!target?.closest('.build-right-menu')
}
const isStyleToolbar = (target: HTMLElement | undefined): boolean => {
  return !!target?.closest('.style-toolbar')
}

const isResizeDiv = (el: HTMLElement | undefined | null): boolean => {
  return !!el?.classList.contains('hover-edge')
}

let mouseDownOnTextEditableComponent = false
let manualDisableHotkeys = false

export const useHotkeyControl = () => {
  // Hotkeys are normally disabled based on editor state (e.g. modal showing)
  // This is a manual control for when it can't be inferred from editor state
  const setHotkeysDisabled = (disabled: boolean) => {
    manualDisableHotkeys = disabled
  }

  return { setHotkeysDisabled }
}

export const useBuildEvent = () => {
  const {
    site,
    editor,
    deleteSelected,
    selectComponentParent,
    setCustomStyle,
    setCustomStyles,
  } = useBuild()
  const { siteStore } = useSiteSource()
  const { pressCopy, pressPaste } = useCopyPaste()
  const { undo, redo } = useHistory()
  const { pressDuplicate } = useDuplicateComponent()
  const { dragging: paddingMarginDragData, drag, stopDrag } = usePaddingMarginEdit()
  const { closeMixinMenu } = useMixinMenuUi()

  let buildWindow: HTMLElement | null = null

  const clickRenderer = (target: HTMLElement | undefined) => {
    setBuildSubmenu(editor.value, undefined)
    if (site.value.editor?.resizeData) {
      site.value.editor.resizeData = undefined
      siteStore.saveEditor(site.value.editor)
    } else {
      const componentId =
        target?.id ||
        target?.closest('.component-content-container, .svg-container')?.parentElement?.id
      if (componentId) {
        const component = site.value.context.components[componentId]
        if (component) {
          selectComponent(site.value, component)
        }
      }
    }
  }
  const clickBuildMenu = (target: HTMLElement | undefined) => {
    if (
      // Close the active Build Submenu if any other part of the menu was clicked
      !(
        (editor.value?.buildSubmenu === BuildSubmenu.New &&
          target?.closest('#build-new')) ||
        (editor.value?.buildSubmenu === BuildSubmenu.Custom &&
          target?.closest('#build-custom')) ||
        (editor.value?.buildSubmenu === BuildSubmenu.Page &&
          target?.closest('#build-page')) ||
        (editor.value?.buildSubmenu === BuildSubmenu.File &&
          target?.closest('#build-file')) ||
        (editor.value?.buildSubmenu === BuildSubmenu.Behavior &&
          target?.closest('#build-behaviors')) ||
        (editor.value?.buildSubmenu === BuildSubmenu.Asset &&
          target?.closest('#build-asset')) ||
        (editor.value?.buildSubmenu === BuildSubmenu.History &&
          target?.closest('#build-history'))
      )
    ) {
      setBuildSubmenu(editor.value, undefined)
    }
  }
  const clickStyleToolbar = (_target: HTMLElement | undefined) => {
    setBuildSubmenu(editor.value, undefined)
  }
  const clickRightMenu = (target: HTMLElement | undefined) => {
    if (!target?.closest('.to-reusable-button')) {
      setBuildSubmenu(editor.value, undefined)
    }
    builderContext.rightMenuFocused.value = true
  }
  const clickComponentTree = (componentTreeItemId: string) => {
    setBuildSubmenu(editor.value, undefined)
    if (editor.value) {
      editor.value.componentTreeRenameData.itemId = componentTreeItemId
    }
  }
  const handleClick = (event: Event) => {
    const target = event.target as HTMLElement | undefined
    const clickedComponentTreeItemId = findClickedComponentTreeItemId(target)

    if (
      editor.value &&
      clickedComponentTreeItemId !== editor.value.componentTreeRenameData?.itemId
    ) {
      editor.value.componentTreeRenameData = { itemId: undefined, renaming: false }
    }
    builderContext.rightMenuFocused.value = false

    if (isRenderer(target)) {
      if (!mouseDownOnTextEditableComponent) {
        clickRenderer(target)
      }
      if (isProseMirrorLink(target)) {
        // Prevent links in prosemirror editor from being opened upon click.
        event.preventDefault()
      }
    } else if (isStyleToolbar(target)) {
      clickStyleToolbar(target)
    } else if (isBuildMenu(target)) {
      clickBuildMenu(target)
    } else if (isBuildRightMenu(target)) {
      clickRightMenu(target)
    } else if (clickedComponentTreeItemId) {
      clickComponentTree(clickedComponentTreeItemId)
    }
    mouseDownOnTextEditableComponent = false
  }

  const pressEscape = () => {
    if (editor?.value?.componentTreeRenameData.renaming) {
      // This is for the case where rename input is still visible in the tree, but
      // the input has lost focus. i.e. clicking on the hide/show button of the
      // same component in the tree during rename.
      editor.value.componentTreeRenameData.renaming = false
    } else if (editor.value?.editorDropdown) {
      setEditorDropdown(editor.value, undefined)
    } else if (editor.value?.buildSubmenu) {
      setBuildSubmenu(editor.value, undefined)
    } else if (
      editor.value?.componentTab.editEvent !== undefined ||
      editor.value?.componentTab.editInput !== undefined ||
      editor.value?.componentTab.editInputValue !== undefined ||
      editor.value?.componentTab.editInfo !== undefined
    ) {
      clearComponentTabState(editor.value)
    } else if (isEditingStyles()) {
      // Let the style menu handle escape
    } else if (editor.value?.editingMixinData) {
      closeMixinMenu()
    } else if (
      editor.value?.mode &&
      [EditorMode.Theme, EditorMode.Styles].includes(editor.value.mode)
    ) {
      toggleEditorMenu(editor.value, EditorMode.SelectedComponent, true)
    } else {
      selectComponentParent()
    }
  }

  const pressEnter = () => {
    const data = editor.value?.componentTreeRenameData
    if (data?.itemId && !data?.renaming) {
      if (editor.value) {
        editor.value.componentTreeRenameData.renaming = true
      }
    }
  }

  const pressTab = async (e: KeyboardEvent) => {
    // TODO -- alert the user that editing styles are active, or find a way to disable tab
    // when a style property is selected, without disabling tab in other situations
    if (editingCommandCount() > 0 || site.value.editor?.mode === EditorMode.Styles) {
      return
    }
    const { selectedComponent } = editor.value ?? {}
    if (selectedComponent) {
      if (editor.value?.componentTreeRenameData.renaming) {
        editor.value.componentTreeRenameData.renaming = false
      }
      if (e.shiftKey) {
        selectPreviousComponent(site.value, selectedComponent)
      } else {
        selectNextComponent(site.value, selectedComponent, true)
      }
      // Remove focus, some browsers will select the next DOM element on Tab keydown
      ;(document.activeElement as HTMLElement)?.blur()
      builderContext.rightMenuFocused.value = false
    }
  }

  const handleKeyup = (event: KeyboardEvent) => {
    // Special case for escape when prosemirror active
    if (
      event.key === Keys.Escape &&
      editor.value?.selectedComponent &&
      prosemirrorActive(event)
    ) {
      document.getElementById(editor.value.selectedComponent.id)?.focus()
    }
    if (manualDisableHotkeys || hotkeysDisabled(event)) {
      return
    }
    if (event.key === Keys.Escape) {
      pressEscape()
    } else if (event.key === Keys.Enter) {
      pressEnter()
    } else if (event.key === Keys.Tab) {
      pressTab(event)
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (manualDisableHotkeys || hotkeysDisabled(event)) {
      return
    }
    if (event.key === Keys.Delete) {
      deleteSelected()
    } else if (event.ctrlKey || event.metaKey) {
      if (event.key === Keys.c || event.key === Keys.C) {
        const selection = window.getSelection()
        if (selection?.type !== 'Range') {
          pressCopy(event)
        }
      } else if (event.key === Keys.v || event.key === Keys.V) {
        pressPaste(event)
      } else if (event.key === Keys.d || event.key === Keys.D) {
        pressDuplicate(event)
      } else if (event.key === Keys.z || event.key === Keys.Z) {
        if (event.shiftKey) {
          redo(true)
        } else {
          undo(true)
        }
      }
    } else if (!event.shiftKey) {
      event.preventDefault()
      triggerHotkey(site.value, event.key as Keys)
    }
  }

  const handleMousemove = (e: MouseEvent) => {
    const editor = site.value.editor
    if (paddingMarginDragData.value) {
      drag(e)
      return
    }
    const target = e.target as HTMLElement
    const component =
      resolveComponent(site.value.context, target?.id) ??
      // This is for elements that use an additional wrapper for hover edges, such as img.
      // Kebab case "component-id" will be converted to camel case "componentId".
      // See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset#name_conversion
      resolveComponent(site.value.context, target?.dataset.componentId) ??
      editor?.resizeData?.component
    if (editor) {
      const data = editor.resizeData
      if (component && data) {
        // Height
        const oldHeightStyle: IStyleEntry | undefined = data.hasHeightProp
          ? {
              pseudoClass: CssPseudoClass.Default,
              property: Css.Height,
              value: `${data.startHeight}${data.heightUnit}`,
            }
          : undefined
        const newHeightStyle: IStyleEntry = {
          pseudoClass: CssPseudoClass.Default,
          property: Css.Height,
          value: calcNextHeight(editor, e, data),
        }

        // Width
        const oldWidthStyle: IStyleEntry | undefined = data.hasWidthProp
          ? {
              pseudoClass: CssPseudoClass.Default,
              property: Css.Width,
              value: `${data.startWidth}${data.widthUnit}`,
            }
          : undefined
        const newWidthStyle: IStyleEntry = {
          pseudoClass: CssPseudoClass.Default,
          property: Css.Width,
          value: calcNextWidth(e, data),
        }

        // Get hover wrap
        let hoverWrap: HTMLElement | undefined = undefined
        if (target.classList.contains('hover-wrap')) {
          hoverWrap = target
        } else if (target.parentElement?.classList.contains('hover-wrap')) {
          hoverWrap = target.parentElement
        }

        // Update component styles
        if (data.side === 'bottom') {
          setCustomStyle(data.component, oldHeightStyle, newHeightStyle, !data.firstMove)
          // Update the height of hover wrap, if it exists
          hoverWrap?.style.setProperty('height', newHeightStyle.value)
        } else if (data.side === 'right') {
          setCustomStyle(data.component, oldWidthStyle, newWidthStyle, !data.firstMove)
          // Update the width of hover wrap, if it exists
          hoverWrap?.style.setProperty('width', newWidthStyle.value)
        } else if (data.side === 'bottom-right') {
          setCustomStyles(
            data.component,
            [
              {
                oldStyle: oldHeightStyle,
                newStyle: newHeightStyle,
              },
              {
                oldStyle: oldWidthStyle,
                newStyle: newWidthStyle,
              },
            ],
            !data.firstMove,
          )

          // Update the width & height of hover wrap, if it exists
          hoverWrap?.style.setProperty('width', newWidthStyle.value)
          hoverWrap?.style.setProperty('height', newHeightStyle.value)
        }
        data.firstMove = false
      } else if (!isResizeDiv(target)) {
        editor.hoveredComponent = component
      }
    }
  }

  const handleMousedown = (e: MouseEvent) => {
    const target = e.target as HTMLElement

    const { editView, selectedComponent } = editor.value ?? {}

    // If the cursor is dragged while ProseMirror is active, mouseup/click outside the
    // component shouldn't de-select the current component. Convenient for selecting editable text
    const mousedownComponent = resolveComponent(site.value.context, target.id)
    mouseDownOnTextEditableComponent =
      !!target.closest('.ProseMirror') ||
      (mousedownComponent !== undefined &&
        editView !== undefined &&
        mousedownComponent.id === selectedComponent?.id)

    let resizeCmp = target.parentElement
    if (resizeCmp?.classList.contains('hover-wrap')) {
      // This is for elements that use an additional wrapper for hover edges, such as img.
      resizeCmp = resizeCmp.children[0] as HTMLElement
    }
    const component = resolveComponent(site.value.context, resizeCmp?.id)
    const side = target.classList[target.classList.length - 1]
    if (
      parent &&
      site.value.editor &&
      resizeCmp &&
      component &&
      ['bottom', 'right', 'bottom-right'].includes(side)
    ) {
      const initialHeightProp = resolvedComponentStyle(
        site.value.context,
        component,
        CssPseudoClass.Default,
        Css.Height,
        activeBreakpoint.value.id,
      )
      const initialWidthProp = resolvedComponentStyle(
        site.value.context,
        component,
        CssPseudoClass.Default,
        Css.Width,
        activeBreakpoint.value.id,
      )

      const resizeCmpRect = resizeCmp.getBoundingClientRect()
      const parentRect = (resizeCmp.parentElement as HTMLElement).getBoundingClientRect()

      let startHeight = initialHeightProp || `${resizeCmpRect.height}px`
      if (!isLengthValue(startHeight)) {
        // Use the current height (px) of the resized component as the initial height
        startHeight = `${resizeCmpRect.height}px`
      }

      let startWidth = initialWidthProp
      if (!startWidth) {
        const resizeCmpIsAbsolute =
          resizeCmp?.classList.contains('hover-wrap-absolute') ||
          resizeCmp?.classList.contains('hover-absolute')

        if (resizeCmpIsAbsolute) {
          startWidth = `${resizeCmpRect.width}px`
        } else {
          startWidth = '100%'
        }
      } else if (!isLengthValue(startWidth)) {
        // Use the current width (px) of the resized component as the initial width
        startWidth = `${resizeCmpRect.width}px`
      }

      const heightUnit = startHeight.replace(/[-\d.]/g, '') as CssUnit
      const widthUnit = startWidth.replace(/[-\d.]/g, '') as CssUnit

      const resizeHeight = ['bottom', 'bottom-right'].includes(side)
      const resizeWidth = ['right', 'bottom-right'].includes(side)

      const heightPxPerPercent = getHeightPxPerPercent(parentRect, heightUnit)
      const widthPxPerPercent = getWidthPxPerPercent(parentRect, widthUnit)

      if (resizeHeight || resizeWidth) {
        site.value.editor.resizeData = {
          component,
          hasWidthProp: !!initialWidthProp,
          hasHeightProp: !!initialHeightProp,
          startX: e.clientX,
          startY: e.clientY,
          startWidth: parseInt(startWidth ?? '0'),
          startHeight: parseInt(startHeight ?? '0'),
          widthUnit,
          heightUnit,
          firstMove: true,
          side,
          widthPxPerPercent,
          heightPxPerPercent,
        }
        e.preventDefault()
      }
    }
  }

  const handleMouseup = (e: MouseEvent) => {
    const editor = site.value.editor
    if (editor?.resizeData) {
      editor.resizeData = undefined
      siteStore.saveEditor(editor)
    }
    if (paddingMarginDragData.value) {
      stopDrag(e)
      return
    }
  }

  const handleMouseleave = (_e: MouseEvent) => {
    if (site.value.editor) {
      site.value.editor.hoveredComponent = undefined
    }
    stopDrag()
  }

  onMounted(() => {
    buildWindow = document.getElementById('build-content-window')
    document.addEventListener('mousemove', handleMousemove)
    buildWindow?.addEventListener('mouseleave', handleMouseleave)
    document.addEventListener('mousedown', handleMousedown)
    document.addEventListener('mouseup', handleMouseup)
    document.addEventListener('mouseleave', handleMouseleave)
    document.addEventListener(clickEventType, handleClick)
    document.addEventListener('keyup', handleKeyup)
    document.addEventListener('keydown', handleKeydown)
  })
  onUnmounted(() => {
    document.removeEventListener(clickEventType, handleClick)
    document.removeEventListener('mousemove', handleMousemove)
    buildWindow?.removeEventListener('mouseleave', handleMouseleave)
    document.removeEventListener('mousedown', handleMousedown)
    document.removeEventListener('mouseup', handleMouseup)
    document.removeEventListener('mouseleave', handleMouseleave)
    document.removeEventListener('keyup', handleKeyup)
    document.removeEventListener('keydown', handleKeydown)
  })
}
