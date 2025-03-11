<template>
  <div class="asset-image">
    <div v-if="assetPlaceholder" class="asset-preview">
      <img :src="assetPlaceholder" />
    </div>
    <PSAsset v-else :asset="assetUrl" :canPlayVideo="false" :contentHash="asset.size" />
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { PSAsset } from '@pubstudio/frontend/ui-widgets'
import { ISiteAssetViewModel } from '@pubstudio/shared/type-api-platform-site-asset'
import { ASSET_PLACEHOLDERS } from '../lib/use-site-assets'

const { asset } = defineProps<{
  asset: ISiteAssetViewModel
  assetUrl: string
}>()

const assetPlaceholder = computed(() => {
  return ASSET_PLACEHOLDERS[asset.content_type]
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.asset-image {
  position: relative;
}
.asset-image :deep(.ps-asset-image) {
  height: 100px;
  object-fit: cover;
}
.asset-preview {
  @mixin flex-center;
  height: 100px;
  img,
  svg {
    width: 40%;
  }
}
</style>
