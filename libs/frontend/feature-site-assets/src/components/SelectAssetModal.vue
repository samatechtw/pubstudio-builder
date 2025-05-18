<template>
  <Modal :show="show" cls="select-asset-modal" @cancel="cancel">
    <div class="modal-title">
      {{ t('build.select_asset') }}
      <PSButton
        class="upload-button"
        size="medium"
        :text="t('upload')"
        @click="showCreateModal = true"
      />
    </div>
    <div class="modal-text">
      {{ t('build.asset_text') }}
    </div>
    <div class="asset-filter-row">
      <STInput
        v-model="externalUrl"
        name="external-url"
        class="external-url"
        :placeholder="t('assets.external_url')"
      />
      <PSButton
        class="external-url-button"
        size="medium"
        :text="t('set')"
        @click="setExternalUrl"
      />
    </div>
    <div class="divider" />
    <div class="asset-filter-row">
      <STMultiselect
        :value="filter.site_id"
        valueKey="id"
        labelKey="name"
        :placeholder="t('site')"
        :options="resolvedSites as any"
        :clearable="!!filter.site_id"
        class="site-select"
        @select="updateSite($event as ILocalOrApiSite | undefined)"
      />
      <STMultiselect
        v-if="contentTypes?.length"
        :value="filter.content_type"
        valueKey="key"
        :options="contentTypes"
        :clearable="true"
        :caret="true"
        :placeholder="t('assets.content_type')"
        class="asset-content-type"
        @select="updateContentType"
      />
      <STInput
        v-model="filter.search"
        name="asset-name"
        class="asset-name-input"
        :placeholder="t('assets.name')"
        @update:modelValue="updateSearch"
      />
    </div>
    <div class="assets-wrap">
      <div v-if="loading" class="assets-spinner-wrap">
        <Spinner class="assets-spinner" :size="16" color="#2a17d6" />
      </div>
      <div v-else-if="!siteAssets?.length" class="no-asset">
        {{ t('build.no_matching_results') }}
      </div>
      <div
        v-for="asset in siteAssets"
        v-else
        :key="asset.id"
        class="asset-item"
        :title="asset.name"
      >
        <div v-if="ASSET_PLACEHOLDERS[asset.content_type]" class="asset-preview">
          <img :src="ASSET_PLACEHOLDERS[asset.content_type]" />
        </div>
        <img v-else class="asset-image" :src="urlFromAsset(asset)" :alt="asset.name" />
        <div class="asset-name">
          {{ asset.name }}
        </div>
        <div class="asset-hover" @click="emitSelect(asset)">
          <PSButton class="select-button" size="medium" :text="t('build.select')" />
        </div>
      </div>
    </div>
    <CreateAssetModal
      :show="showCreateModal"
      :sites="sites"
      :initialSiteId="filter.site_id || initialSiteId"
      :loadSites="true"
      @complete="createComplete"
      @cancel="showCreateModal = false"
    />
  </Modal>
</template>

<script lang="ts" setup>
import { toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'
import { STMultiselect } from '@samatech/vue-components'
import { Modal, PSButton, Spinner } from '@pubstudio/frontend/ui-widgets'
import { useSites } from '@pubstudio/frontend/feature-sites'
import {
  AssetContentType,
  ISiteAssetViewModel,
  ICreatePlatformSiteAssetResponse,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { urlFromAsset } from '@pubstudio/frontend/util-asset'
import CreateAssetModal from './CreateAssetModal.vue'
import { ASSET_PLACEHOLDERS } from '../lib/use-site-assets'
import { ILocalOrApiSite, useAssetsFilter } from '../lib/use-assets-filter'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    show: boolean
    initialUrl?: string
    initialSiteId?: string
    contentTypes?: AssetContentType[]
  }>(),
  {
    initialUrl: undefined,
    initialSiteId: undefined,
    contentTypes: undefined,
  },
)
const { show, initialUrl, initialSiteId } = toRefs(props)

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'select', asset: ISiteAssetViewModel): void
  (e: 'externalUrl', url: string): void
}>()

const { sites } = useSites()
const {
  updateSite,
  updateSearch,
  updateContentType,
  listAssets,
  loading,
  resolvedSites,
  siteAssets,
  filter,
  showCreateModal,
  externalUrl,
} = useAssetsFilter({ initialSiteId, initialUrl, sites })

const setExternalUrl = () => {
  emit('externalUrl', externalUrl.value)
}

const cancel = () => {
  emit('cancel')
}

const emitSelect = (asset: ISiteAssetViewModel) => {
  if (asset) {
    emit('select', asset)
  }
}

const createComplete = (asset: ICreatePlatformSiteAssetResponse) => {
  showCreateModal.value = false
  emit('select', asset)
}

watch(show, async (modalShown) => {
  if (modalShown) {
    await listAssets()
  }
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.select-asset-modal {
  .modal-inner {
    width: 640px;
    max-width: 95%;
    min-height: 320px;
    max-height: 95%;
    overflow-y: scroll;
  }
  .modal-title {
    margin: 0 0 16px;
  }
  .modal-text {
    margin-bottom: 16px;
  }
  .asset-filter-row {
    display: flex;
    align-items: center;
    margin-top: 8px;
  }
  .site-select {
    width: 132px;
  }
  .divider {
    @mixin divider;
    margin: 8px 0;
  }
  .asset-content-type {
    width: 124px;
    margin-left: 10px;
  }
  .asset-name-input {
    flex-grow: 1;
    margin-left: 10px;
  }
  .upload-button {
    margin: 0 36px 0 auto;
    min-width: 88px;
    padding: 0 16px;
  }
  .select-button {
    min-width: 56px;
    height: 32px;
    font-size: 12px;
    padding: 0 10px;
    white-space: nowrap;
  }
  .external-url {
    flex-grow: 1;
  }
  .external-url-button {
    margin-left: 12px;
    min-width: 60px;
    padding: 0 12px;
  }
  .assets-spinner-wrap {
    @mixin flex-center;
    width: 100%;
    height: 40px;
    margin-top: 8px;
  }
  .no-asset {
    @mixin title-thin 16px;
  }
  .assets-wrap {
    display: flex;
    flex-wrap: wrap;
    row-gap: 12px;
    column-gap: 12px;
    margin-top: 16px;
    max-height: 50vh;
    overflow: auto;
  }
  .asset-hover {
    @mixin overlay;
    @mixin flex-center;
    background-color: rgba($grey-500, 0.5);
    opacity: 0;
    transition: opacity 0.2s ease-in;
  }
  .asset-item {
    position: relative;
    width: calc((100% - 24px) / 4);
    height: 100px;
    display: flex;
    align-items: center;
    flex-direction: column;
    border: 2px solid $grey-300;
    cursor: pointer;
    &:hover .asset-hover {
      opacity: 1;
    }
  }
  .asset-image {
    height: 100%;
    object-fit: cover;
  }
  .asset-preview {
    width: 30%;
    padding-top: 16px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  .asset-name {
    @mixin text 13px;
    position: absolute;
    bottom: 0;
    padding: 2px 8px;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
    color: white;
    background-color: rgba($grey-500, 0.65);
  }
}
</style>
