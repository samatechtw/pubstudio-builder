<template>
  <div class="page-menu" @click.stop>
    <PageMenuEdit v-if="editing" class="page-menu-content" />
    <PageMenuTabs v-else class="page-menu-content" />
  </div>
</template>

<script lang="ts" setup>
import { usePageMenu } from '../../lib/use-page-menu'
import PageMenuEdit from './PageMenuEdit.vue'
import PageMenuTabs from './PageMenuTabs.vue'

const { editing } = usePageMenu()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.page-menu {
  .page-menu-content {
    width: 100%;
  }
}
</style>
