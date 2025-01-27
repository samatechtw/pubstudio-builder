import { IContent, RenderMode, renderVueComponent } from '@pubstudio/frontend/util-render'
import { RouterLink } from '@pubstudio/frontend/util-router'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import { defineComponent, h, onMounted, onUnmounted, PropType, toRefs } from 'vue'
import { registerCustomEvents, removeListeners } from './custom-event-handlers'
import { computePropsContent } from './render'

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
      registerCustomEvents(site.value, component.value, false)

      onMounted(() => {
        // TODO -- remove this or trigger specific custom events in editor
        // const { custom } = computeEvents(site.value, component.value)
        registerCustomEvents(site.value, component.value, true)
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
          if (tag === 'svg' && content.includes('<svg')) {
            tag = 'div'
          }
        } else {
          children = content
        }
        if (tag === 'a') {
          const path = props.href ?? ''
          const linkProps = {
            ...renderProps,
            to: { path },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as Record<string, any>
          return h(RouterLink, linkProps, () => children)
        } else if (tag === 'vue') {
          return renderVueComponent(site.value.context, component.value, renderProps)
        }

        return h(tag as string, renderProps, children)
      }
    },
  })
}
