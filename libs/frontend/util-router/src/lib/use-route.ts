import { computed, ComputedRef, inject, Ref } from 'vue'
import { IResolvedRoute } from './i-route'
import { IRouter } from './i-router'
import { RouterSymbol } from './router-injection-keys'

export const ensureMatchedRoutes = <M = unknown>(
  from: string,
): Ref<IResolvedRoute<M>[]> => {
  const router = inject<IRouter<M>>(RouterSymbol)
  if (!router?.matchedRoutes) {
    throw new Error(`No matchedRoutes. Use \`app.use(router)\` before ${from}`)
  }

  return router.matchedRoutes
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
