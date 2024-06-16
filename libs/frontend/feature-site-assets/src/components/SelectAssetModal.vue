<template>
  <Modal :show="show" cls="select-asset-modal" @cancel="cancel">
    <div class="modal-title">
      {{ t('build.select_asset') }}
      <PSButton
        class="create-button"
        size="medium"
        :text="t('create')"
        @click="showCreateModal = true"
      />
    </div>
    <div class="modal-text">
      {{ t('build.asset_text') }}
    </div>
    <div class="asset-filter-row">
      <PSInput
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
      <PSMultiselect
        :value="filter.site_id"
        valueKey="id"
        labelKey="name"
        :placeholder="t('site')"
        :options="resolvedSites"
        :clearable="!!filter.site_id"
        class="site-select"
        @select="updateSite"
      />
      <PSMultiselect
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
      <PSInput
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
        <img class="asset-image" :src="urlFromAsset(asset)" :alt="asset.name" />
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
import { computed, inject, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  Modal,
  PSButton,
  PSInput,
  PSMultiselect,
  Spinner,
} from '@pubstudio/frontend/ui-widgets'
import { ISiteViewModel } from '@pubstudio/shared/type-api-platform-site'
import { useSites } from '@pubstudio/frontend/feature-sites'
import { store } from '@pubstudio/frontend/data-access-web-store'
import {
  AssetContentType,
  SiteAssetState,
  IListPlatformSiteAssetsRequest,
  ISiteAssetViewModel,
  ICreatePlatformSiteAssetResponse,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { debounce } from '@pubstudio/shared/util-debounce'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { PSApi } from '@pubstudio/frontend/util-api'
import { useSiteAssetApi } from '@pubstudio/frontend/data-access-api'
import { ILocalSiteRelationViewModel } from '@pubstudio/shared/type-api-platform-user'
import { urlFromAsset } from '@pubstudio/frontend/util-asset'
import CreateAssetModal from './CreateAssetModal.vue'

type ILocalOrApiSite = ILocalSiteRelationViewModel | ISiteViewModel

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    show: boolean
    initialSiteId?: string
    contentTypes?: AssetContentType[]
  }>(),
  {
    initialSiteId: undefined,
    contentTypes: undefined,
  },
)
const { show, initialSiteId } = toRefs(props)

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'select', asset: ISiteAssetViewModel): void
  (e: 'externalUrl', url: string): void
}>()

const rootApi = inject(ApiInjectionKey) as PSApi
const api = useSiteAssetApi(rootApi)

const { sites } = useSites()

const defaultFilter = (): IListPlatformSiteAssetsRequest => {
  let siteId = initialSiteId.value

  if (siteId === 'scratch') {
    siteId = undefined
  } else if (siteId === 'identity') {
    siteId = store.user.identity.value.id
  }

  return {
    site_id: siteId,
    content_type: undefined,
    search: undefined,
  }
}

const loading = ref(false)
const siteAssets = ref<ISiteAssetViewModel[]>()
const filter = ref<IListPlatformSiteAssetsRequest>(defaultFilter())
const showCreateModal = ref(false)
const externalUrl = ref('')

const resolvedSites = computed<ILocalOrApiSite[]>(() => [
  store.user.identity.value,
  ...(sites.value ?? []),
])

const setExternalUrl = () => {
  emit('externalUrl', externalUrl.value)
}

const updateSite = async (site: ILocalOrApiSite | undefined) => {
  filter.value.site_id = site?.id
  await listAssets()
}

const updateSearch = debounce(async (search: string) => {
  filter.value.search = search
  await listAssets()
}, 500)

const updateContentType = async (contentType: AssetContentType | undefined) => {
  filter.value.content_type = contentType
  await listAssets()
}

const cancel = () => {
  cleanup()
  emit('cancel')
}

const cleanup = () => {
  filter.value = defaultFilter()
  externalUrl.value = ''
}

const emitSelect = (asset: ISiteAssetViewModel) => {
  if (asset) {
    emit('select', asset)
  }
}

const listAssets = async () => {
  loading.value = true
  try {
    const response = await api.listSiteAssets({
      ...filter.value,
      user_id: store.user.id.value,
      state: SiteAssetState.Uploaded,
    })
    siteAssets.value = response.results
  } catch (e) {
    console.log('List site assets error: ', e)
    siteAssets.value = undefined
  }
  loading.value = false
}

const createComplete = (asset: ICreatePlatformSiteAssetResponse) => {
  showCreateModal.value = false
  emit('select', asset)
}

watch(show, async (modalShown) => {
  if (modalShown) {
    await listAssets()
  } else {
    cleanup()
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
  .create-button {
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
