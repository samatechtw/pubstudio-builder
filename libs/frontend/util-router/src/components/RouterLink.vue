<template>
  <a
    class="router-link"
    :class="{ 'router-link-active': isActive, 'router-link-exact-active': isExactActive }"
    :href="link.url"
    :target="target"
    @click="navigate"
  >
    <slot />
  </a>
</template>

<script lang="ts" setup>
import { computed, inject, Ref, toRefs } from 'vue'
import { IRoute, IResolvedRoute } from '../lib/i-route'
import { INavigateOptions, IPathNavigateOptions } from '../lib/i-router'
import { MatchedRoutesSymbol } from '../lib/router-injection-keys'
import { useRouter } from '../lib/use-router'
import { normalizeUrl } from '../lib/href-to-url'

const props = withDefaults(
  defineProps<{
    to: INavigateOptions | string
    target?: string
    replace?: boolean
  }>(),
  {
    target: undefined,
    replace: false,
  },
)

const { to, replace } = toRefs(props)

const router = useRouter()
const matchedRoutes = inject<Ref<IResolvedRoute[]>>(MatchedRoutesSymbol)

const targetRoute = computed<IRoute<unknown> | undefined>(() => {
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
  if (typeof to.value === 'string' || 'name' in to.value) {
    let url
    if (typeof to.value === 'string') {
      url = router.computeResolvedPath(targetRoute.value?.path, {})
    } else {
      url = router.computeResolvedPath(targetRoute.value?.path, to.value)
    }
    return { url, isExternal: false }
  } else {
    const rawUrl =
      (to.value as IPathNavigateOptions)?.path ?? (to.value as unknown as string)
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
  if (!link.value.isExternal && !e.ctrlKey && !e.metaKey) {
    // e.preventDefault()
    if (replace.value) {
      router.replace(pathOptions(to.value))
    } else {
      router.push(pathOptions(to.value))
    }
  }
}
</script>
