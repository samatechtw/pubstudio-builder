import {
  computeEvents,
  registerCustomEvents,
  removeListeners,
} from '@pubstudio/frontend/feature-render'
import { IContent, RenderMode, renderVueComponent } from '@pubstudio/frontend/util-render'
import { RouterLink } from '@pubstudio/frontend/util-router'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import { defineComponent, h, onMounted, onUnmounted, PropType, toRefs } from 'vue'
import EmbedRouterLink from './EmbedRouterLink.vue'
import { computePropsContent } from './render-preview'
import { routeToPreviewPath } from './route-to-preview-path'

export interface ILiveComponentProps {
  site: ISite
  component: IComponent
  renderMode: string
}

export const PreviewComponent = () => {
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
        type: String,
        required: true,
      },
    },
    setup(props: ILiveComponentProps) {
      const { site, component, renderMode } = toRefs(props)
      const mode = renderMode.value as RenderMode
      const { custom } = computeEvents(site.value, component.value)
      registerCustomEvents(component.value, custom, null, false)

      onMounted(() => {
        const { custom } = computeEvents(site.value, component.value)
        registerCustomEvents(component.value, custom, null, true)
      })
      onUnmounted(() => {
        removeListeners(component.value)
      })
      return () => {
        const { content, props } = computePropsContent(site.value, component.value, mode)

        let renderProps = props
        let children: IContent
        let tag = component.value.tag

        if (typeof content === 'string') {
          // `innerHTML` should not exist in `props` when content (children) is a
          // non-string value because Vue will use whatever value it contains to
          // render components when using `h()`.
          renderProps = { ...props, innerHTML: content }
          if (tag === 'svg' && content.includes('<svg')) {
            tag = 'div'
          }
        } else {
          children = content
        }

        if (tag === 'a') {
          // TODO: merge back with `live-component.ts` once the custom router is used for `web`
          const hrefProp = (props.href ?? '') as string
          const { url, isExternal } = routeToPreviewPath(hrefProp, mode)
          if (isExternal) {
            // Absolute path, use the `href` in renderProps as is (don't forward query string and hash).
            // We are unable to use router-link here because router-link treats any given link as a
            // relative path to the current site.
            renderProps.href = url
            return h('a', renderProps, children)
          } else {
            const copiedRenderProps = {
              ...renderProps,
              to: url,
            }
            delete (copiedRenderProps as Record<string, unknown>).href

            if (mode === RenderMode.PreviewEmbed) {
              return h(EmbedRouterLink, copiedRenderProps, () => children)
            } else {
              return h(RouterLink, copiedRenderProps, () => children)
            }
          }
        } else if (tag === 'vue') {
          return renderVueComponent(site.value.context, component.value, renderProps)
        }

        return h(tag as string, renderProps, children)
      }
    },
  })
}
