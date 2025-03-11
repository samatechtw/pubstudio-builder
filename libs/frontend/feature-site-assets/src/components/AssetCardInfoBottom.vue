<template>
  <div class="asset-info-bottom">
    <div class="asset-size">
      {{ formatBytes(asset.size) }}
    </div>
    <div
      v-if="
        [
          SiteAssetState.Created,
          SiteAssetState.Replacing,
          SiteAssetState.Expired,
        ].includes(asset.state)
      "
      :class="`asset-status ${asset.state}`"
    >
      <InfoBubble :customIcon="true" :message="t('assets.asset_state')" />
    </div>
    <AssetCardDropdown
      :assetId="asset.id"
      @delete="emit('delete')"
      @preview="emit('preview')"
      @replace="emit('replace')"
    />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { InfoBubble } from '@pubstudio/frontend/ui-widgets'
import {
  ISiteAssetViewModel,
  SiteAssetState,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { formatBytes } from '@pubstudio/shared/util-format'
import AssetCardDropdown from './AssetCardDropdown.vue'

const { t } = useI18n()

defineProps<{
  asset: ISiteAssetViewModel
}>()

const emit = defineEmits<{
  (e: 'update', asset: ISiteAssetViewModel): void
  (e: 'delete'): void
  (e: 'preview'): void
  (e: 'replace'): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.asset-info-bottom {
  @mixin flex-row;
  align-items: center;
}
.toggle-icon {
  @mixin size 100%;
  position: relative;
}
.asset-size {
  @mixin title-thin 14px;
  color: $grey-700;
}
.asset-status {
  @mixin size 10px;
  margin-left: 8px;
  cursor: pointer;
  border-radius: 50%;
  color: $color-text;
  display: none;
  &.Created,
  &.Replacing,
  &.Uploaded {
    display: block;
    background-color: $grey-500;
  }
  &.Expired {
    display: block;
    background-color: $color-error;
  }
}
</style>
