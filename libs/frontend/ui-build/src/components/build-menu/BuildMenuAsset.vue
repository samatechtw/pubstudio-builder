<template>
  <div
    class="asset-menu"
    :class="dragging"
    @drop="dropUploadImage"
    @dragenter="dragStart"
    @dragleave="dragEnd"
    @dragend="dragEnd"
  >
    <div class="assets-top">
      <div class="asset-title">
        {{ t('assets.assets') }}
      </div>
      <router-link :to="{ name: 'Assets' }" target="_blank" class="assets-link">
        <Launch class="asset-manager" />
      </router-link>
      <Plus
        v-if="siteStore.siteId.value !== 'scratch'"
        class="button-plus"
        @click="emit('showCreate')"
      />
    </div>
    <div class="asset-list">
      <AssetCardSmall
        v-for="(asset, index) in assets"
        :key="asset.id"
        :asset="asset"
        :small="true"
        class="asset-card"
        :style="{ 'z-index': (assets?.length ?? 1) - index }"
        @update="updateAssetList"
        @delete="deletedAssetId = asset.id"
        @preview="previewAssetUrl = $event"
        @replace="showReplace(asset)"
      />
      <Spinner v-if="loadingAssets" class="assets-spinner" :size="14" color="#2a17d6" />
      <div v-else-if="assets?.length === 0" class="assets-empty">
        {{ t('assets.no_assets') }}
      </div>
    </div>
    <DeleteAssetModal
      :show="!!deletedAssetId"
      :assetId="deletedAssetId ?? ''"
      @deleted="removeDeletedAsset"
      @cancel="deletedAssetId = undefined"
    />
    <PreviewAssetModal
      :show="!!previewAssetUrl"
      :assetUrl="previewAssetUrl ?? ''"
      @cancel="previewAssetUrl = undefined"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { Launch, Plus, Spinner } from '@pubstudio/frontend/ui-widgets'
import {
  useSiteAssets,
  AssetCardSmall,
  DeleteAssetModal,
  PreviewAssetModal,
  showCreateAssetModal,
  IUploadFileResult,
  updateAsset,
} from '@pubstudio/frontend/feature-site-assets'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { ISiteAssetViewModel } from '@pubstudio/shared/type-api-platform-site-asset'

const { siteStore } = useSiteSource()
const {
  listAssets,
  updateAssetList,
  assets,
  updateKey,
  loading: loadingAssets,
} = useSiteAssets()
const { t } = useI18n()

const dragging = ref(false)
const selectedFile = ref<File>()

const emit = defineEmits<{
  (e: 'showCreate'): void
}>()

watch(updateKey, () => {
  listAssets({ user_id: store.auth.userId.value })
})

onMounted(() => {
  listAssets({ user_id: store.auth.userId.value })
})

const deletedAssetId = ref<string>()
const previewAssetUrl = ref<string>()

const showReplace = (asset: ISiteAssetViewModel) => {
  showCreateAssetModal.value = true
  updateAsset.value = asset
}

const removeDeletedAsset = () => {
  if (deletedAssetId.value) {
    const deletedAsset = assets.value?.find((asset) => asset.id === deletedAssetId.value)
    assets.value = assets.value?.filter((asset) => asset !== deletedAsset)
    deletedAssetId.value = undefined
  }
}

const uploadComplete = (asset: IUploadFileResult) => {
  updateAssetList(asset)
  updateAsset.value = undefined
  showCreateAssetModal.value = false
}

const handleFileSelect = (e: Event) => {
  if (e && e.type === 'drop') {
    const files = (e as InputEvent).dataTransfer?.files
    if (files) {
      selectedFile.value = files[0]
    }
  }
  dragging.value = false
}
const dragStart = (e: Event) => {
  e.preventDefault()
  dragging.value = true
}
const dragEnd = (e: Event) => {
  e.preventDefault()
  dragging.value = false
}
const dropUploadImage = (e: Event) => {
  e.preventDefault()
  handleFileSelect(e)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.asset-card {
  width: calc(50% - 12px);
  margin-left: 6px;
  margin-top: 6px;
}

.asset-menu {
  @mixin flex-col;
  position: relative;
  height: 100%;
  width: $left-menu-width;
  padding-top: 24px;
  background-color: $blue-100;
  align-items: center;
  overflow-y: auto;
  > div:not(:first-child) {
    margin-top: 4px;
  }
}
.asset-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  margin-left: -8px;
}
.assets-top {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 8px 0 16px;
}
.asset-title {
  @mixin title-semibold 18px;
  color: $color-text;
}
.button-content {
  @mixin flex-row;
  align-items: center;
}
.button-plus {
  @mixin size 24px;
  margin-left: auto;
  cursor: pointer;
}
.assets-link {
  margin: 4px 8px 0;
}
.asset-manager {
  @mixin size 17px;
}
.assets-empty {
  @mixin title-medium 15px;
  color: $grey-500;
  padding: 16px 4px 4px 16px;
}
.assets-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  width: 100%;
}
</style>
