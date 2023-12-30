<template>
  <a
    class="router-link"
    :class="{ 'router-link-active': isActive, 'router-link-exact-active': isExactActive }"
    :href="link.url"
    :target="target"
    @click="navigate"
  >
    {{ JSON.stringify(link) }}
    <slot />
  </a>
</template>

<script lang="ts" setup>
import { computed, inject, Ref, toRefs } from 'vue'
import { IRoute, IResolvedRoute } from '../lib/i-route'
import { INavigateOptions } from '../lib/i-router'
import { MatchedRoutesSymbol } from '../lib/router-injection-keys'
import { useRouter } from '../lib/use-router'
import { normalizeUrl } from '../lib/href-to-url'

const props = withDefaults(
  defineProps<{
    to: INavigateOptions
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
  if ('name' in to.value) {
    const route = router.findRouteByName(to.value.name)
    if (!route) {
      throw new Error(`Failed to find route by name ${name}`)
    }
    return route
  } else {
    return router.resolve(to.value.path)
  }
})

const link = computed(() => {
  if ('name' in to.value) {
    const url = router.computeResolvedPath(targetRoute.value as IRoute<unknown>, to.value)
    return { url, isExternal: false }
  } else {
    const { url, isExternal } = normalizeUrl(to.value.path ?? '')
    return { url, isExternal }
  }
})

const isActive = computed(
  () => matchedRoutes?.value.some((route) => route.name === targetRoute.value?.name),
)

const isExactActive = computed(() => {
  if (!matchedRoutes) {
    return false
  }
  const { length } = matchedRoutes.value
  const lastMatch = matchedRoutes.value[length - 1]
  return lastMatch?.name === targetRoute.value?.name
})

const navigate = (e: Event) => {
  if (!link.value.isExternal) {
    e.preventDefault()
    if (replace.value) {
      router.replace(to.value)
    } else {
      router.push(to.value)
    }
  }
}
</script>
