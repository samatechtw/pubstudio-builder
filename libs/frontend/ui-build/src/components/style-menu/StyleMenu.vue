<template>
  <div class="styles-menu" @click.stop>
    <StyleMenuTabs
      v-if="!isEditingMixin && !editGlobalStyle"
      class="styles-menu-content"
    />
    <GlobalStyleEdit v-else-if="editGlobalStyle" class="styles-menu-content" />
    <StyleMenuEdit v-else class="styles-menu-content" />
  </div>
</template>

<script lang="ts" setup>
import { useGlobalStyles, useMixinMenu } from '@pubstudio/frontend/feature-build'
import StyleMenuEdit from './StyleMenuEdit.vue'
import GlobalStyleEdit from './GlobalStyleEdit.vue'
import StyleMenuTabs from './StyleMenuTabs.vue'

const { isEditingMixin } = useMixinMenu()
const { editGlobalStyle } = useGlobalStyles()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.styles-menu {
  padding: 16px;
}
.styles-menu-content {
  width: 100%;
}
</style>
