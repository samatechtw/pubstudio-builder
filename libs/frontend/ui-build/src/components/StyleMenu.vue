<template>
  <div class="styles-menu" @click.stop>
    <StyleMenuList v-if="!editing" class="styles-menu-content" />
    <StyleMenuEdit v-else class="styles-menu-content" />
  </div>
</template>

<script lang="ts" setup>
import { onUnmounted } from 'vue'
import { useReusableStyleMenu, resetStyleMenu } from '@pubstudio/frontend/feature-build'
import StyleMenuList from './StyleMenuList.vue'
import StyleMenuEdit from './StyleMenuEdit.vue'

const { editing } = useReusableStyleMenu()

onUnmounted(() => {
  // Resetting style menu on unmounted because StyleMenuEdit widget is reused
  // between component menu (style tab) and style menu (reusable style).
  resetStyleMenu()
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.styles-menu {
  padding: 16px;
  .styles-menu-content {
    width: 100%;
  }
}
</style>
