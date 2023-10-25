import {
  useBuild,
  useCopyPaste,
  useDuplicateComponent,
  usePaddingMarginEdit,
} from '@pubstudio/frontend/feature-build'
import {
  clearComponentTabState,
  getComponentTreeItemId,
  setBuildSubmenu,
  setSelectedComponent,
  setStyleToolbarMenu,
} from '@pubstudio/frontend/feature-editor'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { resolvedComponentStyle } from '@pubstudio/frontend/util-build'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { isDynamicComponent } from '@pubstudio/frontend/util-ids'
import { Keys } from '@pubstudio/frontend/util-key-listener'
import {
  BuildSubmenu,
  Css,
  CssPseudoClass,
  CssUnit,
  IComponent,
  IStyleEntry,
  StyleToolbarMenu,
} from '@pubstudio/shared/type-site'
import { onMounted, onUnmounted } from 'vue'
import { hotkeysDisabled } from './util-build-event'
import {
  calcNextHeight,
  calcNextWidth,
  getHeightPxPerPercent,
  getWidthPxPerPercent,
} from './util-resize'

const clickEventType = document.ontouchstart !== null ? 'click' : 'touchend'

const isRenderer = (target: HTMLElement | undefined): boolean => {
  return !!target?.closest('.build-content')
}
const isComponentTree = (target: HTMLElement | undefined): boolean => {
  return !!target?.closest('.component-tree')
}
const isBuildMenu = (target: HTMLElement | undefined): boolean => {
  return !!target?.closest('.build-menu')
}
const isRightMenu = (target: HTMLElement | undefined): boolean => {
  return !!target?.closest('.right-menu')
}
const isStyleToolbar = (target: HTMLElement | undefined): boolean => {
  return !!target?.closest('.style-toolbar')
}

const isResizeDiv = (el: HTMLElement | undefined | null): boolean => {
  return !!el?.classList.contains('hover-edge')
}

let mouseDownOnTextEditableComponent = false

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
  const { pressDuplicate } = useDuplicateComponent()
  const { drag, stopDrag } = usePaddingMarginEdit()
  let buildWindow: HTMLElement | null = null

  const selectComponent = (component: IComponent) => {
    setSelectedComponent(site.value.editor, component)

    // Scroll to the corresponding tree item if component tree is visible
    if (editor.value?.showComponentTree) {
      const treeItemId = getComponentTreeItemId(component)
      const treeItemElement = document.getElementById(treeItemId)
      treeItemElement?.scrollIntoView()
    }
  }

  const clickRenderer = (target: HTMLElement | undefined) => {
    setBuildSubmenu(editor.value, undefined)
    if (site.value.editor?.resizeData) {
      site.value.editor.resizeData = undefined
      siteStore.value.save(site.value)
    } else {
      const componentId =
        target?.id || target?.closest('.component-content-container')?.parentElement?.id
      if (componentId) {
        const component = site.value.context.components[componentId]
        if (component) {
          selectComponent(component)
        } else if (target.parentElement && isDynamicComponent(target.id)) {
          // TODO -- this is fragile, it's probably better to add dynamic components to the
          // Site's `context.components`
          const index = parseInt(target.id.split('_').pop() ?? '')
          const parent = site.value.context.components[target.parentElement.id]
          if (parent.children?.[index]) {
            selectComponent(parent.children[index])
          }
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
  const clickRightMenu = (_target: HTMLElement | undefined) => {
    setBuildSubmenu(editor.value, undefined)
  }
  const clickComponentTree = (_target: HTMLElement | undefined) => {
    setBuildSubmenu(editor.value, undefined)
  }
  const handleClick = (event: Event) => {
    const target = event.target as HTMLElement | undefined
    if (isRenderer(target)) {
      if (!mouseDownOnTextEditableComponent) {
        clickRenderer(target)
      }
    } else if (isStyleToolbar(target)) {
      clickStyleToolbar(target)
    } else if (isBuildMenu(target)) {
      clickBuildMenu(target)
    } else if (isRightMenu(target)) {
      clickRightMenu(target)
    } else if (isComponentTree(target)) {
      clickComponentTree(target)
    }
    mouseDownOnTextEditableComponent = false
  }

  const pressEscape = () => {
    if (editor.value?.editBehavior) {
      // Handled directly in `BehaviorModal.vue`'s modal widget
    } else if (editor.value?.styleMenu) {
      setStyleToolbarMenu(editor.value, undefined)
    } else if (editor.value?.buildSubmenu) {
      setBuildSubmenu(editor.value, undefined)
    } else if (
      editor.value?.componentTab.editEvent !== undefined ||
      editor.value?.componentTab.editInput !== undefined ||
      editor.value?.componentTab.editInputValue !== undefined ||
      editor.value?.componentTab.editStyle !== undefined ||
      editor.value?.componentTab.editInfo !== undefined
    ) {
      clearComponentTabState(editor.value)
    } else {
      selectComponentParent()
    }
  }

  const pressHotkey = (e: KeyboardEvent, hotkeyFn: (e: KeyboardEvent) => void) => {
    // Don't activate hotkey if an input/textarea has focus, or a modal is active
    // TODO -- is there a general way to make sure another element doesn't have focus?
    if (hotkeysDisabled(e, editor.value)) {
      return
    }
    hotkeyFn(e)
  }

  const handleKeyup = (event: KeyboardEvent) => {
    if (event.key === Keys.Escape) {
      pressHotkey(event, pressEscape)
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === Keys.Delete) {
      pressHotkey(event, deleteSelected)
    } else if (event.key === Keys.LowerC || event.key === Keys.UpperC) {
      const selection = window.getSelection()
      if (selection?.type !== 'Range') {
        pressHotkey(event, pressCopy)
      }
    } else if (event.key === Keys.LowerV || event.key === Keys.UpperV) {
      pressHotkey(event, pressPaste)
    } else if (event.key === Keys.LowerD || event.key === Keys.UpperD) {
      pressHotkey(event, pressDuplicate)
    }
  }

  const handleMousemove = (e: MouseEvent) => {
    const editor = site.value.editor
    if (editor?.styleMenu === StyleToolbarMenu.Size) {
      drag(e)
      return
    }
    const target = e.target as HTMLElement
    const component =
      resolveComponent(site.value.context, target?.id) ??
      // This is for elements that use an additional wrapper for hover edges, such as img.
      // Kebab case "component-id" will be converted to camel case "componentId".
      // See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset#name_conversion
      resolveComponent(site.value.context, target?.dataset.componentId)
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
          value: calcNextHeight(e, data),
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

      const startHeight = initialHeightProp || `${resizeCmpRect.height}px`
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
      siteStore.value.save(site.value)
    }
    if (editor?.styleMenu === StyleToolbarMenu.Size) {
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
