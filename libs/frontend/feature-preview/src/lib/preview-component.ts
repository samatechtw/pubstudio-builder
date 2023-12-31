import {
  computeEvents,
  IContent,
  registerCustomEvents,
  removeListeners,
} from '@pubstudio/frontend/feature-render'
import { hrefToUrl } from '@pubstudio/frontend/util-router'
import { IComponent, ISite, Tag } from '@pubstudio/shared/type-site'
import { defineComponent, h, onMounted, onUnmounted, PropType, toRefs } from 'vue'
import { RouterLink } from 'vue-router'
import { mergeSearch } from './merge-search'
import { computePropsContent } from './render-preview'

export interface ILiveComponentProps {
  site: ISite
  component: IComponent
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
    },
    setup(props: ILiveComponentProps) {
      const { site, component } = toRefs(props)
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
        const { content, props } = computePropsContent(site.value, component.value)

        let renderProps = props
        let children: IContent
        let tag = component.value.tag

        if (typeof content === 'string') {
          // `innerHTML` should not exist in `props` when content (children) is a
          // non-string value because Vue will use whatever value it contains to
          // render components when using `h()`.
          renderProps = { ...props, innerHTML: content }
          if (tag === Tag.Svg && content.includes('<svg')) {
            tag = Tag.Div
          }
        } else {
          children = content
        }

        if (tag === Tag.A) {
          // TODO: merge back with `live-component.ts` once the custom router is used for `web`
          const hrefProp = (props.href ?? '') as string

          const { url, isExternal } = hrefToUrl(hrefProp, '/preview')
          if (isExternal) {
            // Absolute path, use the `href` in renderProps as is (don't forward query string and hash).
            // We are unable to use router-link here because router-link treats any given link as a
            // relative path to the current site.
            renderProps.href = url
            return h('a', renderProps, children)
          } else {
            // Relative path, forward query string and hash.

            // In vue-router, users can pass in an optional `href` prop to <router-link> to override
            // the href generated by the required prop `to`. If `to` and `href` are both present,
            // `href` will be used to render <a>, but upon click, users will actually be navigated to
            // the href generate by `to`. To avoid confusion, it's better to use `to` alone here.

            // Since users may provide href with custom hash and query, we have to extract those values
            // from the `href` prop and merge them with editor hash and query. User-provided hash&query
            // will take precedence over editor hash&query.

            const {
              pathname: previewPathName,
              search: userSearch,
              hash: userHash,
            } = new URL(url)
            const { search: editorSearch, hash: editorHash } = window.location

            const mergedSearchParams = mergeSearch(editorSearch, userSearch)
            const uniqueSearchKeys = new Set(mergedSearchParams.keys())

            let queryString = ''

            const queryParams = Array.from(uniqueSearchKeys).flatMap((key) => {
              const values = mergedSearchParams.getAll(key)
              return values.map((value) => `${key}=${value}`)
            })

            if (queryParams.length) {
              queryString = `?${queryParams.join('&')}`
            }

            const copiedRenderProps = {
              ...renderProps,
              to: `${previewPathName}${queryString}${userHash || editorHash}`,
            }
            delete (copiedRenderProps as Record<string, unknown>).href

            return h(RouterLink, copiedRenderProps, () => children)
          }
        }

        return h(tag as string, renderProps, children)
      }
    },
  })
}
