import { computed, ComputedRef, inject, Ref } from 'vue'
import { IResolvedRoute } from './i-route'
import { MatchedRoutesSymbol } from './router-injection-keys'

/**
 * Returns the deepest matched route in the router.
 */
export const useRoute = <M = unknown>(): ComputedRef<IResolvedRoute<M> | undefined> => {
  const matchedRoutes = inject<Ref<IResolvedRoute<M>[]>>(MatchedRoutesSymbol)

  if (!matchedRoutes) {
    throw new Error(
      'Failed to find the provider for matchedRoutes. Please use `app.use(router)` before using `useRoute()`',
    )
  }

  const route = computed(() => {
    const { length } = matchedRoutes.value
    return matchedRoutes.value[length - 1]
  })

  return route
}
