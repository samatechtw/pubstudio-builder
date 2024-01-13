import { buildContentWindowInnerId } from '@pubstudio/frontend/feature-build'
import {
  computeEvents,
  IContent,
  registerCustomEvents,
  removeListeners,
} from '@pubstudio/frontend/feature-render'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { findStyles } from '@pubstudio/frontend/util-component'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'
import { Css, IComponent, ISite, Tag } from '@pubstudio/shared/type-site'
import {
  computed,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  PropType,
  toRefs,
  VNode,
} from 'vue'
import { computePropsContent } from '../render-builder'
import { findNonDynamic, useDragDrop } from './use-drag-drop'

export interface IDndComponentProps {
  site: ISite
  component: IComponent
  renderKey: string
}

const renderImageHover = (
  site: ISite,
  component: IComponent,
  props: Record<string, unknown>,
  content: IContent,
): VNode => {
  const imgElement = document.getElementById(component.id)

  let position = '',
    top = '',
    right = '',
    width = '',
    height = ''
  // TODO -- find a more efficient way to compute this. It can't be taken from `imgComputedStyle`
  // because margin is set to 0 when the img is hovered, so the wrapper gets margin=0 if the img is clicked
  const margin =
    findStyles(
      [Css.Margin],
      site,
      component,
      descSortedBreakpoints.value,
      activeBreakpoint.value,
    ).margin ?? ''

  if (imgElement) {
    const imgComputedStyle = getComputedStyle(imgElement)

    position = imgComputedStyle.position
    top = imgComputedStyle.top
    right = imgComputedStyle.right

    width = imgComputedStyle.width
    height = imgComputedStyle.height
    position = imgComputedStyle.position
  }

  let hoverWrapClass = 'hover hover-wrap'

  if (position === 'absolute') {
    hoverWrapClass += ' hover-wrap-absolute'
  }

  // Pass the margin of img to the wrapper element, and set the margin of the rendered img
  // to 0 during hover to avoid shifting issue.
  const imgStyleProp = structuredClone(props.style ?? {}) as Record<string, unknown>
  // Set the width&height of <img> to 100% because the width&height of the hover wrap (parent) is defined.
  // In HTML, if the width or height of the parent of <img> is a length value (i.e. 100%, 100px, 1rem, etc.),
  // the % in the dimensions of <img> will be calculated based on the size of its parent element.
  imgStyleProp.width = '100%'
  imgStyleProp.height = '100%'
  imgStyleProp.margin = '0'
  imgStyleProp.inset = '0'

  const img = h(component.tag as string, {
    ...props,
    style: imgStyleProp,
  })

  return h(
    'div',
    {
      'data-component-id': component.id,
      style: {
        // Use inline-block to simulate the bottom space caused by the inline behavior of <img>.
        // See https://stackoverflow.com/a/5804278/19772349 for more information.
        display: 'inline-block',
        width,
        height,
        margin,
        flexShrink: '0',
        // absolute positioning for wrapper
        top,
        right,
      },
      class: hoverWrapClass,
    },
    [img, ...(content as VNode[])],
  )
}

export const BuilderDndComponent = defineComponent({
  props: {
    site: {
      type: Object as PropType<ISite>,
      required: true,
    },
    component: {
      type: Object as PropType<IComponent>,
      required: true,
    },
    renderKey: {
      type: String,
      required: true,
    },
  },
  setup(props: IDndComponentProps) {
    const { site, component, renderKey } = toRefs(props)

    const { custom } = computeEvents(site.value, component.value)
    const root = document.getElementById(buildContentWindowInnerId)
    registerCustomEvents(component.value, custom, root, false)

    const dndRef = computed(() => {
      const dragCmp = findNonDynamic(component.value)
      const componentIndex =
        component.value.parent?.children?.findIndex((c) => c.id === component.value.id) ??
        0
      return useDragDrop({
        site: site.value,
        componentId: dragCmp?.id,
        getParentId: () => dragCmp?.parent?.id,
        getComponentIndex: () => componentIndex,
        isParent: component.value.id !== dragCmp?.id,
        dragleave: () => {
          if (runtimeContext.buildDndState.value?.hoverCmpId === component.value.id) {
            runtimeContext.buildDndState.value = undefined
          }
        },
        dragend: () => {
          runtimeContext.buildDndState.value = undefined
        },
        drop: () => {
          runtimeContext.buildDndState.value = undefined
        },
      })
    })
    onMounted(() => {
      const { custom } = computeEvents(site.value, component.value)
      const root = document.getElementById(buildContentWindowInnerId)
      registerCustomEvents(component.value, custom, root, true)
    })
    onUnmounted(() => {
      removeListeners(component.value)
    })
    return () => {
      const dnd = dndRef.value
      const dndState = dnd.dndState
      const propsContent = computePropsContent(
        site.value,
        component.value,
        RenderMode.Build,
        dndState.value,
      )
      const { editView, selectedComponent } = site.value.editor ?? {}
      const isRoot = !component.value.parent
      const editViewFocus = editView?.hasFocus()
      const droppableDndProps = {
        onDragenter: dnd.dragenter,
        onDragover: dnd.dragover,
        onDragleave: dnd.dragleave,
        onDrop: dnd.drop,
        onDragend: dnd.dragend,
      }

      // If ProseMirror editor is active, only allow dragend event to be fired.
      // If the component is root component, only allow hover&drop events to be fired.
      // Otherwise allow all drag, hover, and drop events to be fired.
      let dndProps: Record<string, unknown> = {}
      if (editViewFocus) {
        dndProps = { onDragend: dnd.dragend }
      } else if (isRoot) {
        dndProps = droppableDndProps
      } else {
        dndProps = {
          draggable: !editView || selectedComponent?.id !== component.value.id,
          onDragstart: dnd.dragstart,
          onDrag: dnd.drag,
          ...droppableDndProps,
        }
      }

      if (
        dndState.value?.hoverSelf ||
        dndState.value?.hoverTop ||
        dndState.value?.hoverRight ||
        dndState.value?.hoverBottom ||
        dndState.value?.hoverLeft
      ) {
        runtimeContext.buildDndState.value = {
          hoverSelf: dndState.value.hoverSelf,
          hoverTop: dndState.value.hoverTop,
          hoverRight: dndState.value.hoverRight,
          hoverBottom: dndState.value.hoverBottom,
          hoverLeft: dndState.value.hoverLeft,
          hoverCmpId: component.value.id,
          hoverCmpParentIsRow: dndState.value.parentIsRow,
        }
      }

      const props = {
        ...propsContent.props,
        ...dndProps,
        // TODO -- is this necessary?
        key: renderKey.value,
        ref: dnd.elementRef,
        // Make builder dnd component not tab-focusable to avoid jumping between
        // activeElement and component when on Tab press.
        tabindex: '-1',
      } as Record<string, unknown>

      const tag = component.value.tag
      const componentClass = (propsContent.props.class ?? []) as string[]

      // Img can't contain divs, so add a wrapper for the hover UI
      if (
        tag === Tag.Img &&
        componentClass.includes('hover') &&
        // Don't render hover wrap if the image is currently being resized
        site.value.editor?.resizeData?.component.id !== component.value.id
      ) {
        return renderImageHover(site.value, component.value, props, propsContent.content)
      } else if (tag === Tag.Svg) {
        return h(Tag.Div, props, propsContent.content)
      } else {
        return h(component.value.tag as string, props, propsContent.content)
      }
    }
  },
})
