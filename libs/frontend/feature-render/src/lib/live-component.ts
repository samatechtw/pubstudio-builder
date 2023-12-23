import { RenderMode } from '@pubstudio/frontend/util-render'
import { RouterLink } from '@pubstudio/frontend/util-router'
import { IComponent, ISite, Tag } from '@pubstudio/shared/type-site'
import { defineComponent, h, onMounted, onUnmounted, PropType, toRefs } from 'vue'
import { registerCustomEvents, removeListeners } from './custom-event-handlers'
import { IContent } from './i-props-content'
import { computePropsContent } from './render'
import { computeEvents } from './render-helpers'

export interface ILiveComponentProps {
  site: ISite
  component: IComponent
  renderMode: RenderMode
}

export const LiveComponent = () => {
  return defineComponent({
    props: {
      site: {
        type: Object as PropType<ISite>,
        required: true,
      },
      component: {
        type: Object as PropType<IComponent>,
        required: true,
      },
      renderMode: {
        type: String as PropType<RenderMode>,
        required: true,
      },
    },
    setup(props: ILiveComponentProps) {
      const { site, component, renderMode } = toRefs(props)
      const { custom } = computeEvents(site.value, component.value)
      registerCustomEvents(component.value, custom, null, true)

      onMounted(() => {
        const { custom } = computeEvents(site.value, component.value)
        registerCustomEvents(component.value, custom, null, false)
      })
      onUnmounted(() => {
        removeListeners(component.value)
      })
      return () => {
        const { content, props } = computePropsContent(
          site.value,
          component.value,
          renderMode.value,
        )

        let renderProps = props
        let children: IContent
        let tag = component.value.tag

        if (typeof content === 'string') {
          // `innerHTML` should not exist in `props` when content (children) is a
          // non-string value because Vue will use whatever value it contains to
          // render components when using `h()`.
          renderProps = { ...props, innerHTML: content }

          // Vue render function requires a tag, and we don't want two layers of <svg>
          if (tag === Tag.Svg && content.includes('<svg')) {
            tag = Tag.Div
          }
        } else {
          children = content
        }

        if (tag === Tag.A) {
          const path = props.href ?? ''
          return h(
            RouterLink,
            {
              ...renderProps,
              to: { path },
            },
            () => children,
          )
        }

        return h(tag as string, renderProps, children)
      }
    },
  })
}
