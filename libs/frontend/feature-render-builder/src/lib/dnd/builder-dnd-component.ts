import { builderContext } from '@pubstudio/frontend/util-builder'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { IComponent, ISite, Tag } from '@pubstudio/shared/type-site'
import { computed, defineComponent, h, PropType, toRefs } from 'vue'
import { computePropsContent } from '../render-builder'
import { useDragDrop } from './use-drag-drop'

export interface IDndComponentProps {
  site: ISite
  component: IComponent
  renderKey: string
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
      const { tag, content } = component.value
      const { editView } = site.value.editor ?? {}
      const isRoot = !component.value.parent
      const editViewFocus = editView?.hasFocus()
      const childrenEditViewMounted = false
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
          draggable: true,
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

      // Img can't contain divs, so add a wrapper for the hover UI
      if (tag === Tag.Vue) {
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
