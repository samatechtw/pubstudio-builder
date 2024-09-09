<template>
  <div class="ps-route-tab">
    <router-link v-for="tab in tabs" :key="tab.name" :to="tab" class="ps-route-tab-item">
      {{ tab.text ?? tab.name }}
    </router-link>
  </div>
</template>

<script lang="ts" setup>
export interface RouteTab {
  name: string
  text?: string
}

defineProps<{
  tabs: RouteTab[]
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.ps-route-tab {
  @mixin flex-row;
  overflow-x: auto;
  .ps-route-tab-item {
    @mixin title-semibold 14px;
    display: block;
    padding: 12px 16px;
    color: $grey-500;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
  }
  .router-link-exact-active {
    color: $color-primary;
    border-bottom-color: $color-primary;
  }
}
</style>
