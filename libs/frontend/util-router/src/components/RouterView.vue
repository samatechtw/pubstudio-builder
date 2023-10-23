<template>
  <template v-if="PageContent">
    <PageContent />
  </template>
</template>

<script lang="ts" setup>
import { Ref, computed, inject, provide } from 'vue'
import { IResolvedRoute } from '../lib/i-route'
import { MatchedRoutesSymbol, RouteLevelSymbol } from '../lib/router-injection-keys'

const routeLevel = inject<number>(RouteLevelSymbol)
const matchedRoutes = inject<Ref<IResolvedRoute[]>>(MatchedRoutesSymbol)

if (!matchedRoutes) {
  throw new Error(
    'Failed to find the provider for matchedRoutes. Please use `app.use(router)` before using router-view',
  )
}

// Provide the next route level for nested router views
provide(RouteLevelSymbol, routeLevel + 1)

const PageContent = computed(() => matchedRoutes.value[routeLevel]?.component)
</script>
