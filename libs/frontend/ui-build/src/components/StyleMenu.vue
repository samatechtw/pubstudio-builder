<template>
  <div class="styles-menu" @click.stop>
    <StyleMenuList v-if="!isEditingMixin" class="styles-menu-content" />
    <StyleMenuEdit v-else class="styles-menu-content" />
  </div>
</template>

<script lang="ts" setup>
import { useReusableStyleMenu } from '@pubstudio/frontend/feature-build'
import StyleMenuList from './StyleMenuList.vue'
import StyleMenuEdit from './StyleMenuEdit.vue'

const { isEditingMixin } = useReusableStyleMenu()
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
