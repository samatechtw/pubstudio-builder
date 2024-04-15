<template>
  <template v-if="PageContent">
    <PageContent />
  </template>
</template>

<script lang="ts" setup>
import { computed, inject, provide } from 'vue'
import { RouteLevelSymbol } from '../lib/router-injection-keys'
import { ensureMatchedRoutes } from '../lib/use-route'

const routeLevel = inject<number>(RouteLevelSymbol) ?? 0
const matchedRoutes = ensureMatchedRoutes('RouterView')

// Provide the next route level for nested router views
provide(RouteLevelSymbol, routeLevel + 1)

const PageContent = computed(() => matchedRoutes.value[routeLevel]?.component)
</script>
