<template>
  <a
    class="router-link"
    :class="{ 'router-link-active': isActive, 'router-link-exact-active': isExactActive }"
    :href="href"
    :target="target"
    @click.prevent="navigate"
  >
    <slot />
  </a>
</template>

<script lang="ts" setup>
import { computed, inject, Ref, toRefs } from 'vue'
import { IRoute, IResolvedRoute } from '../lib/i-route'
import { INavigateOptions } from '../lib/i-router'
import { MatchedRoutesSymbol } from '../lib/router-injection-keys'
import { useRouter } from '../lib/use-router'

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

const href = computed(() => {
  if ('name' in to.value) {
    return router.computeResolvedPath(targetRoute.value as IRoute<unknown>, to.value)
  } else {
    return to.value.path
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

const navigate = () => {
  if (replace.value) {
    router.replace(to.value)
  } else {
    router.push(to.value)
  }
}
</script>
