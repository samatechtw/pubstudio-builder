import { getPref } from '@pubstudio/frontend/data-access-command'
import { IComponentOverlay } from '@pubstudio/frontend/type-ui-widgets'
import { builderContext } from '@pubstudio/frontend/util-builder'
import { IEditorContext, IPage } from '@pubstudio/shared/type-site'
import { sleep } from '@pubstudio/shared/util-core'
import { ref } from 'vue'
import { computeHoverOverlay } from './compute-hover-overlay'
import { computeSelectionOverlay } from './compute-selection-overlay'

export const selectionDimensions = ref<IComponentOverlay>()

// Use `ref`+`watch` instead of `computed` because we have to wait for the screen to (re)render
// before calculating the width and height of the component on page load & after selection.
export const selectionOverlayStyle = ref<Record<string, string> | undefined>()
export const hoverOverlayStyle = ref<Record<string, string> | undefined>()

interface IHoverOverlay {
  style: Record<string, string>
  smallWidth: boolean
  smallHeight: boolean
}
export const dndHoverOverlay = ref<IHoverOverlay | undefined>()

const setDndHoverOverlay = (
  editor: IEditorContext | undefined,
  activePage: IPage | undefined,
) => {
  const component = editor?.selectedComponent
  if (!component || component.id === activePage?.root.id) {
    return undefined
  }
  const dim = computeHoverOverlay(editor, component)
  if (dim) {
    dndHoverOverlay.value = {
      style: {
        top: `${dim.top}px`,
        left: `${dim.left}px`,
        width: `${dim.width}px`,
        height: `${dim.height}px`,
      },
      smallWidth: dim.width < 120,
      smallHeight: dim.height < 70,
    }
  } else {
    dndHoverOverlay.value = undefined
  }
}

const setSelectionOverlayStyle = (editor: IEditorContext | undefined) => {
  const dim = computeSelectionOverlay(editor, editor?.selectedComponent?.id)
  selectionDimensions.value = dim
  if (dim) {
    const outlineColor = getPref(editor, 'selectedComponentOutlineColor')
    selectionOverlayStyle.value = {
      top: `${dim.top - 1}px`,
      left: `${dim.left - 1}px`,
      width: `${dim.width}px`,
      height: `${dim.height}px`,
      border: `2px solid ${outlineColor}`,
    }
  } else {
    selectionOverlayStyle.value = undefined
  }
}

export const setBuildOverlays = async (
  editor: IEditorContext | undefined,
  activePage: IPage | undefined,
) => {
  // This sleep is necessary for buildContentWindowInner and componentElement
  await sleep(1)
  setSelectionOverlayStyle(editor)
  setDndHoverOverlay(editor, activePage)
}
