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
    <div :id="assetMenuId" class="asset">
      <div ref="toggleRef" class="dropdown-toggle" @click="toggleMenu">
        <MenuHorizontal class="toggle-icon" />
      </div>
      <div
        ref="menuRef"
        class="ps-dropdown asset-dropdown"
        :class="{ 'ps-dropdown-opened': opened }"
        :style="menuStyle"
      >
        <div class="ps-dropdown-item rename-action" @click="replaceAsset">
          {{ t('replace') }}
        </div>
        <div class="ps-dropdown-item preview-action" @click="previewAsset">
          {{ t('build.preview') }}
        </div>
        <div class="ps-dropdown-item delete-action" @click="deleteAsset">
          {{ t('delete') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useDropdown } from '@samatech/vue-components'
import { InfoBubble, MenuHorizontal } from '@pubstudio/frontend/ui-widgets'
import {
  ISiteAssetViewModel,
  SiteAssetState,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { formatBytes } from '@pubstudio/shared/util-format'

const { t } = useI18n()

const props = defineProps<{
  asset: ISiteAssetViewModel
}>()
const { asset } = toRefs(props)

const emit = defineEmits<{
  (e: 'update', asset: ISiteAssetViewModel): void
  (e: 'delete'): void
  (e: 'preview'): void
  (e: 'replace'): void
}>()

const assetMenuId = `am-${asset.value.id}`

const { toggleRef, menuRef, opened, menuStyle, setMenuOpened, toggleMenu } = useDropdown({
  clickawayIgnoreSelector: `#${assetMenuId}`,
})

const closeMenu = () => setMenuOpened(false)

const previewAsset = () => {
  emit('preview')
  closeMenu()
}

const replaceAsset = () => {
  emit('replace')
  closeMenu()
}

const deleteAsset = () => {
  emit('delete')
  closeMenu()
}
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
.asset {
  margin-left: auto;
}
.dropdown-toggle {
  @mixin size 26px;
  position: relative;
  cursor: pointer;
  z-index: 10;
  background-color: white;
  border-radius: 50%;
}
.delete-action {
  color: $color-error;
}
</style>
