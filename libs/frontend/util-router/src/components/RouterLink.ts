import { computed, defineComponent, h, PropType, toRefs } from 'vue'
import { normalizeUrl } from '../lib/href-to-url'
import { IResolvedRoute, IRouteWithPathRegex } from '../lib/i-route'
import { INavigateOptions, IPathNavigateOptions, IRouter } from '../lib/i-router'
import { useRouter } from '../lib/use-router'

export const RouterLink = defineComponent({
  props: {
    to: {
      type: [String, Object] as PropType<INavigateOptions | string>,
    },
    target: {
      type: String,
      required: false,
      default: undefined,
    },
    replace: {
      type: Boolean,
      required: false,
      default: false,
    },
    routerOverride: {
      type: Object as PropType<IRouter<unknown>>,
      required: false,
    },
  },
  setup(props, { slots }) {
    const { to, replace, target, routerOverride } = toRefs(props)

    const router = routerOverride.value ?? useRouter()
    const matchedRoutes = router.matchedRoutes

    const targetRoute = computed<
      IResolvedRoute<unknown> | IRouteWithPathRegex<unknown> | undefined
    >(() => {
      if (to.value === undefined) {
        return undefined
      }
      if (typeof to.value === 'string') {
        return router.resolvePath(to.value)
      } else if ('name' in to.value && to.value.name) {
        const route = router.findRouteByName(to.value.name)
        if (!route) {
          throw new Error(`Failed to find route by name ${name}`)
        }
        return route
      } else if ('path' in to.value && to.value.path) {
        return router.resolvePath(to.value.path)
      }
    })

    const link = computed(() => {
      const toPath = to.value ?? ''
      if (typeof toPath === 'string') {
        const url = router.computeResolvedPath(targetRoute.value?.mergedPath, {})
        return { url, isExternal: false }
      } else if ('name' in toPath) {
        const url = router.computeResolvedPath(targetRoute.value?.mergedPath, toPath)
        return { url, isExternal: false }
      } else {
        const rawUrl =
          (toPath as IPathNavigateOptions)?.path ?? (toPath as unknown as string)
        const { url, isExternal } = normalizeUrl(rawUrl)
        return { url, isExternal }
      }
    })

    const isActive = computed(() =>
      matchedRoutes?.value.some((route) => route.name === targetRoute.value?.name),
    )

    const isExactActive = computed(() => {
      if (!matchedRoutes) {
        return false
      }
      const { length } = matchedRoutes.value
      const lastMatch = matchedRoutes.value[length - 1]
      return lastMatch?.name === targetRoute.value?.name
    })

    const pathOptions = (path: string | INavigateOptions): INavigateOptions => {
      if (typeof path === 'string') {
        return { path }
      }
      return path
    }

    const navigate = (e: MouseEvent) => {
      if (!link.value.isExternal && !e.ctrlKey && !e.metaKey && to.value) {
        e.preventDefault()
        if (replace.value) {
          router.replace(pathOptions(to.value))
        } else {
          router.push(pathOptions(to.value))
        }
      }
    }
    const cls = computed(() => {
      return {
        'router-link': true,
        'router-link-active': isActive.value,
        'router-link-exact-active': isExactActive.value,
      }
    })
    return () => {
      const children = slots.default && slots.default(link)
      return h(
        'a',
        {
          class: cls.value,
          href: link.value.url,
          target: target.value,
          // router.replace not supported when target="_blank"
          onClick: target.value === '_blank' ? undefined : navigate,
        },
        children,
      )
    }
  },
})
