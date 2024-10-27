import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { builderContext } from '@pubstudio/frontend/util-builder'
import { findStyles } from '@pubstudio/frontend/util-component'
import { IContent, RenderMode } from '@pubstudio/frontend/util-render'
import { Css, IComponent, ISite, Tag } from '@pubstudio/shared/type-site'
import { computed, defineComponent, h, PropType, toRefs, VNode } from 'vue'
import { computePropsContent } from '../render-builder'
import { useDragDrop } from './use-drag-drop'

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
  dndProps: Record<string, unknown>,
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
    console.log('TEST', imgElement)
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
    draggable: false,
    style: imgStyleProp,
  })

  return h(
    'div',
    {
      'data-component-id': component.id,
      // TODO -- is there a cleaner way to do this? Why doesn't draggable work on the img?
      ...dndProps,
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

    const dndRef = computed(() => {
      const dragCmp = component.value
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
          if (builderContext.buildDndState.value?.hoverCmpId === component.value.id) {
            builderContext.buildDndState.value = undefined
          }
        },
        dragend: () => {
          builderContext.buildDndState.value = undefined
        },
        drop: () => {
          builderContext.buildDndState.value = undefined
        },
      })
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
      const { id, tag, content } = component.value
      const { editView, selectedComponent } = site.value.editor ?? {}
      const isRoot = !component.value.parent
      const editViewFocus = editView?.hasFocus()
      const childrenEditViewMounted = !!editView?.dom.closest(`#${id}`)
      const droppableDndProps = {
        onDragenter: dnd.dragenter,
        onDragover: dnd.dragover,
        onDragleave: dnd.dragleave,
        onDrop: dnd.drop,
        onDragend: dnd.dragend,
      }

      // If ProseMirror editor is active and component has content, only allow dragend event to be fired.
      // If the component is root component, only allow hover&drop events to be fired.
      // Otherwise allow all drag, hover, and drop events to be fired.
      let dndProps: Record<string, unknown> = {}
      if ((!content && editViewFocus) || childrenEditViewMounted) {
        dndProps = droppableDndProps
      } else if (isRoot) {
        dndProps = droppableDndProps
      } else if (tag === Tag.Input || tag === Tag.Textarea) {
        dndProps = {
          draggable: true,
          onDragstart: dnd.dragstart,
          onDrag: dnd.drag,
        }
      } else {
        dndProps = {
          draggable: !editView || selectedComponent?.id !== id,
          onDragstart: dnd.dragstart,
          onDrag: dnd.drag,
          ...droppableDndProps,
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

      const componentClass = (propsContent.props.class ?? []) as string[]

      // Img can't contain divs, so add a wrapper for the hover UI
      if (
        tag === Tag.Img &&
        (componentClass.includes('hover') || propsContent.content?.length) &&
        // Don't render hover wrap if the image is currently being resized
        site.value.editor?.resizeData?.component.id !== component.value.id
      ) {
        return renderImageHover(
          site.value,
          component.value,
          props,
          propsContent.content,
          dndProps,
        )
      } else if (tag === Tag.Vue) {
        return h('div', props, 'View in preview')
      } else if (tag === Tag.Svg) {
        return h(Tag.Div, props, propsContent.content)
      } else if (tag === Tag.Button) {
        // Render as div to avoid space bar triggering click
        return h('div', props, propsContent.content)
      } else {
        return h(tag as string, props, propsContent.content)
      }
    }
  },
})
