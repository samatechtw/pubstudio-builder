<template>
  <div class="assets">
    <AssetsHeader :loadingSites="loadingSites" @upload="showCreate" />
    <div
      v-if="usage !== undefined && usageAllowance !== undefined"
      class="asset-usage-wrap"
    >
      <div class="subtitle">
        {{ t('assets.usage') }}
        <InfoBubble :message="t('assets.usage_info')" class="info" />
      </div>
      <UsageProgress :current="usage" :max="usageAllowance" />
    </div>
    <AssetFilters :sites="sites" @updateFilter="updateFilter" />
    <div v-if="loadingAssets" class="assets-spinner">
      <Spinner :size="24" color="#2a17d6" />
    </div>
    <div v-else class="asset-list">
      <div v-if="assets?.length === 0" class="assets-empty">
        {{ t('assets.no_assets') }}
      </div>
      <AssetCard
        v-for="(asset, index) in assets"
        :key="asset.id"
        :asset="asset"
        :style="{ 'z-index': (assets?.length ?? 0) + 10 - index }"
        @update="updateAssetList"
        @delete="deletedAssetId = asset.id"
        @preview="previewAssetUrl = $event"
        @replace="showReplace(asset)"
      />
    </div>
    <CreateAssetModal
      :show="showCreateModal"
      :sites="sites"
      :assetToUpdate="updateAsset"
      @complete="uploadComplete"
      @cancel="showCreateModal = false"
    />
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
import { ref, onMounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { InfoBubble, Spinner, UsageProgress } from '@pubstudio/frontend/ui-widgets'
import { useSites } from '@pubstudio/frontend/feature-sites'
import { IListPlatformSiteAssetsRequest } from '@pubstudio/shared/type-api-platform-site-asset'
import CreateAssetModal from './CreateAssetModal.vue'
import DeleteAssetModal from './DeleteAssetModal.vue'
import AssetCard from './AssetCard.vue'
import { useSiteAssets, ISiteAssetListItem } from '../lib/use-site-assets'
import AssetsHeader from './AssetsHeader.vue'
import AssetFilters from './AssetFilters.vue'
import PreviewAssetModal from './PreviewAssetModal.vue'
import { IUploadFileResult } from '../lib/upload-asset'

const { t } = useI18n()
const {
  listAssets,
  updateAssetList,
  usage,
  assets,
  loading: loadingAssets,
} = useSiteAssets()
const { listSites, sites, usageAllowance, loading: loadingSites } = useSites()

const showCreateModal = ref(false)
const deletedAssetId = ref<string>()
const previewAssetUrl = ref<string>()
const updateAsset = ref<ISiteAssetListItem | undefined>()

const showCreate = () => {
  updateAsset.value = undefined
  showCreateModal.value = true
}

const showReplace = (asset: ISiteAssetListItem) => {
  showCreateModal.value = true
  updateAsset.value = asset
}

const updateFilter = async (query: IListPlatformSiteAssetsRequest) => {
  await listAssets(query)
}

const removeDeletedAsset = () => {
  if (deletedAssetId.value) {
    const deletedAsset = assets.value?.find((asset) => asset.id === deletedAssetId.value)
    assets.value = assets.value?.filter((asset) => asset !== deletedAsset)
    usage.value = (usage.value ?? 0) - (deletedAsset?.size ?? 0)
    deletedAssetId.value = undefined
  }
}

const uploadComplete = (asset: IUploadFileResult) => {
  updateAssetList({
    ...asset,
    version: (updateAsset.value?.version ?? 0) + 1,
  })
  updateAsset.value = undefined
  showCreateModal.value = false
}

onMounted(async () => {
  await listSites({})
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.assets {
  padding: 64px 0 140px;
  width: 100%;
  min-height: 540px;
  :deep(.bar-bg) {
    background-color: white;
  }
}
.asset-usage-wrap {
  margin-top: 24px;
  width: 100%;
  max-width: 500px;
  .subtitle {
    @mixin flex-row;
    @mixin title 16px;
    margin-bottom: 4px;
    color: $grey-700;
    justify-content: center;
  }
  .info {
    margin-left: 8px;
  }
}
.assets-spinner {
  display: flex;
  justify-content: center;
  min-height: 200px;
}

.asset-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
  margin-left: -16px;
}
.assets-empty {
  @mixin title-medium 18px;
  padding: 64px 0 0 16px;
  color: $grey-500;
}
.asset-card {
  width: calc(25% - 16px);
  margin-left: 16px;
  margin-top: 16px;
}

@media (max-width: 640px) {
  .asset-list {
    margin: 0;
  }
  .asset-card {
    width: 100%;
    margin-left: 0;
  }
}
</style>
