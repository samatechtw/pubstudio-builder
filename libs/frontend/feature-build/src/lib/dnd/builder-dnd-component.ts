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
import { Css, IComponent, IRawStyle, ISite, Tag } from '@pubstudio/shared/type-site'
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
  componentClass: string[],
  content: IContent,
): VNode => {
  const img = h(component.tag as string, props)
  const imgElement = document.getElementById(component.id)

  let [width, height] = ['', '']

  const { width: styleWidth, height: styleHeight } = findStyles(
    [Css.Width, Css.Height],
    site,
    component,
    descSortedBreakpoints.value,
    activeBreakpoint.value,
  )

  if (styleWidth !== '100%' || styleHeight !== '100%') {
    width = styleWidth ?? ''
    height = styleHeight ?? ''
  } else {
    const { width: rectWidth = 0, height: rectHeight = 0 } =
      imgElement?.getBoundingClientRect() ?? {}

    const { builderScale = 1 } = site.editor ?? {}
    const unscaledWidth = Math.floor(rectWidth / builderScale)
    const unscaledHeight = Math.floor(rectHeight / builderScale)

    width = `${unscaledWidth}px`
    height = `${unscaledHeight}px`
  }

  let hoverWrapClass = 'hover hover-wrap'
  let imgStyles: IRawStyle | undefined

  if (componentClass.includes('hover-absolute')) {
    hoverWrapClass += ' hover-wrap-absolute'
    imgStyles = findStyles(
      [Css.Top, Css.Right, Css.Bottom, Css.Left],
      site,
      component,
      descSortedBreakpoints.value,
      activeBreakpoint.value,
    )
  }

  return h(
    'div',
    {
      'data-component-id': component.id,
      style: {
        display: 'flex',
        width,
        height,
        flexShrink: '0',
        // absolute positioning for wrapper
        top: imgStyles?.top,
        right: imgStyles?.right,
        bottom: imgStyles?.bottom,
        left: imgStyles?.left,
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
    const root = document.getElementById('build-content-window-inner')
    registerCustomEvents(component.value, custom, root, false)

    const dndRef = computed(() => {
      const dragCmp = findNonDynamic(component.value)
      const componentIndex =
        component.value.parent?.children?.findIndex((c) => c.id === component.value.id) ??
        0
      return useDragDrop({
        context: site.value.context,
        componentId: dragCmp?.id,
        getParentId: () => dragCmp?.parent?.id,
        getComponentIndex: () => componentIndex,
        isParent: component.value.id !== dragCmp?.id,
        stopAtFirstMatch: true,
      })
    })
    onMounted(() => {
      const { custom } = computeEvents(site.value, component.value)
      const root = document.getElementById('build-content-window-inner')
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
      // Don't drag/drop root component, and disable when ProseMirror is active
      const dndProps =
        component.value.parent && !editView?.hasFocus()
          ? {
              draggable: !editView || selectedComponent?.id !== component.value.id,
              ...dndState,
              onDragstart: dnd.dragstart,
              onDrag: dnd.drag,
              onDragenter: dnd.dragenter,
              onDragover: dnd.dragover,
              onDragleave: dnd.dragleave,
              onDrop: dnd.drop,
              onDragend: dnd.dragend,
            }
          : {
              onDragend: dnd.dragend,
            }

      const props = {
        ...propsContent.props,
        ...dndProps,
        // TODO -- is this necessary?
        key: renderKey.value,
        ref: component.value.parent ? dnd.elementRef : undefined,
      } as Record<string, unknown>

      const tag = component.value.tag
      const componentClass = (propsContent.props.class ?? []) as string[]

      // Img can't contain divs, so add a wrapper for the hover UI
      if (tag === Tag.Img && componentClass.includes('hover')) {
        return renderImageHover(
          site.value,
          component.value,
          props,
          componentClass,
          propsContent.content,
        )
      } else {
        return h(component.value.tag as string, props, propsContent.content)
      }
    }
  },
})
