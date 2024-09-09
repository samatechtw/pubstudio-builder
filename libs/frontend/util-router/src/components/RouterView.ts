import { defineComponent, h, inject, provide, toRaw } from 'vue'
import { RouteLevelSymbol } from '../lib/router-injection-keys'
import { ensureMatchedRoutes } from '../lib/use-route'

export const RouterView = defineComponent({
  setup() {
    const routeLevel = inject<number>(RouteLevelSymbol, 0)
    const matchedRoutes = ensureMatchedRoutes('RouterView')
    // Provide the next route level for nested router views
    provide(RouteLevelSymbol, routeLevel + 1)

    return () => {
      const cmp = matchedRoutes.value[routeLevel]?.component
      return cmp ? h(toRaw(cmp)) : undefined
    }
  },
})
