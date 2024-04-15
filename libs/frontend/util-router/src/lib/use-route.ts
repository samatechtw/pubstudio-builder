import { computed, ComputedRef, inject, Ref } from 'vue'
import { IResolvedRoute } from './i-route'
import { MatchedRoutesSymbol } from './router-injection-keys'

export const ensureMatchedRoutes = <M = unknown>(
  from: string,
): Ref<IResolvedRoute<M>[]> => {
  const routes = inject<Ref<IResolvedRoute<M>[]>>(MatchedRoutesSymbol)
  if (!routes) {
    throw new Error(`No matchedRoutes. Use \`app.use(router)\` before ${from}`)
  }

  return routes
}

/**
 * Returns the deepest matched route in the router.
 */
export const useRoute = <M = unknown>(): ComputedRef<IResolvedRoute<M> | undefined> => {
  const matchedRoutes = ensureMatchedRoutes<M>('useRoute')

  const route = computed(() => {
    const { length } = matchedRoutes.value
    return matchedRoutes.value[length - 1]
  })

  return route
}
