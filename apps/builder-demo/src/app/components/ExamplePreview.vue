<template>
  <div class="example-preview">
    <div class="preview-banner" @click="emit('close')">
      Preview mode. Click here to go back.
    </div>
    <SitePreview />
  </div>
</template>

<script lang="ts" setup>
import { SitePreview } from '@pubstudio/frontend/feature-build'

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.preview-banner {
  @mixin flex-center;
  @mixin title-medium 12px;
  height: 28px;
  cursor: pointer;
  background-color: #eee489;
}
</style>
