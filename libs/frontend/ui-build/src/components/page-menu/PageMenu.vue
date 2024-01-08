<template>
  <div class="page-menu" @click.stop>
    <PageMenuEdit v-if="editing" class="page-menu-content" />
    <PageMenuTabs v-else class="page-menu-content" />
  </div>
</template>

<script lang="ts" setup>
import { usePageMenu } from '@pubstudio/frontend/feature-build'
import PageMenuEdit from './PageMenuEdit.vue'
import PageMenuTabs from './PageMenuTabs.vue'

const { editing } = usePageMenu()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.page-menu-content {
  width: 100%;
  padding: 16px;
}
</style>
