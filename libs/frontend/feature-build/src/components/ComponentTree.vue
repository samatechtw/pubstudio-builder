<template>
  <div class="component-tree" :class="{ 'component-tree-visible': show }">
    <ComponentTreeItem :component="root" :level="0" :componentIndex="0" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useBuild } from '@pubstudio/frontend/feature-build'
import ComponentTreeItem from './ComponentTreeItem.vue'

const { editor, activePage } = useBuild()

const root = computed(() => activePage.value?.root)

const show = computed(() => editor.value?.showComponentTree)
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-tree {
  width: 0;
  max-height: $view-height;
  flex-shrink: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding-bottom: 12px;
  transition: width 0.2s;
  border-right: 1px solid $border-widget;
  &-visible {
    width: 200px;
  }
}
</style>
