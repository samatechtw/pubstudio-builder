<template>
  <Modal :show="show" cls="select-asset-modal" @cancel="cancel">
    <div class="modal-title">
      {{ t('build.select_asset') }}
    </div>
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
      <PSInput
        v-model="filter.search"
        name="asset-name"
        class="asset-name-input"
        :placeholder="t('assets.name')"
        @update:modelValue="updateSearch"
      />
      <PSButton
        class="select-button"
        size="medium"
        :text="t('build.select')"
        :disabled="!selectedAsset"
        @click="emitSelect"
      />
    </div>
    <div class="asset-filter-row">
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
    </div>
    <div class="assets-wrap">
      <div v-if="loading" class="assets-spinner-wrap">
        <PSSpinner class="assets-spinner" :scale="2" color="#2a17d6" />
      </div>
      <div v-else-if="!siteAssets?.length" class="no-asset">
        {{ t('build.no_matching_results') }}
      </div>
      <div
        v-else
        v-for="asset in siteAssets"
        class="asset-item"
        :class="{ 'asset-item-selected': selectedAsset?.id === asset.id }"
        :title="asset.name"
        @click="selectedAsset = asset"
      >
        <img class="asset-image" :src="asset.url" :alt="asset.name" />
        <div class="asset-name">
          {{ asset.name }}
        </div>
        <div v-if="selectedAsset?.id === asset.id" class="asset-selected-mark">
          <Check class="check-mark" color="#0ceabf" />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Check,
  Modal,
  PSButton,
  PSInput,
  PSMultiselect,
  PSSpinner,
} from '@pubstudio/frontend/ui-widgets'
import { ISiteViewModel } from '@pubstudio/shared/type-api-platform-site'
import { useSites } from '@pubstudio/frontend/feature-sites'
import { store } from '@pubstudio/frontend/data-access-web-store'
import {
  AssetContentType,
  SiteAssetState,
  IListPlatformSiteAssetsRequest,
  ISiteAssetViewModel,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { debounce } from '@pubstudio/shared/util-debounce'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { PSApi } from '@pubstudio/frontend/util-api'
import { useSiteAssetApi } from '@pubstudio/frontend/data-access-api'

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
}>()

const rootApi = inject(ApiInjectionKey) as PSApi
const api = useSiteAssetApi(rootApi)

const { sites, listSites } = useSites()

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
const selectedAsset = ref<ISiteAssetViewModel>()

const resolvedSites = computed(() => [store.user.identity.value, ...(sites.value ?? [])])

const updateSite = async (site: ISiteViewModel | undefined) => {
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
  selectedAsset.value = undefined
}

const emitSelect = () => {
  if (selectedAsset.value) {
    emit('select', selectedAsset.value)
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

onMounted(async () => {
  await listSites({})
})

watch(show, async (modalShown) => {
  if (modalShown) {
    await listAssets()
  } else {
    cleanup()
  }
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.select-asset-modal {
  .modal-inner {
    width: 480px;
    max-width: 95%;
    max-height: 95%;
    overflow-y: scroll;
  }
  .modal-title {
    margin-bottom: 16px;
  }
  .asset-filter-row {
    display: flex;
    align-items: center;
    margin-top: 8px;
  }
  .site-select {
    width: 120px;
  }
  .asset-name-input {
    flex-grow: 1;
    margin-left: 12px;
  }
  .select-button {
    margin-left: 8px;
    min-width: 80px;
    width: 80px;
    white-space: nowrap;
  }
  .assets-spinner-wrap {
    @mixin flex-center;
    width: 100%;
    height: 40px;
    margin-top: 8px;
  }
  .assets-wrap {
    display: flex;
    flex-wrap: wrap;
    row-gap: 12px;
    column-gap: 12px;
    margin-top: 16px;
    max-height: 50vh;
    overflow: auto;
    .asset-item {
      position: relative;
      width: calc((100% - 24px) / 3);
      height: 100px;
      display: flex;
      flex-direction: column;
      border: 2px solid $grey-300;
      cursor: pointer;
      &.asset-item-selected {
        border-color: $green-500;
      }
    }
    .asset-image {
      height: 100%;
      object-fit: cover;
    }
    .asset-name {
      position: absolute;
      bottom: 0;
      padding: 2px 8px;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      text-align: center;
      color: white;
      background-color: $black-opaque-4;
    }
    .asset-selected-mark {
      position: absolute;
      right: 0;
      top: 0;
      .check-mark {
        @mixin size 24px;
      }
    }
  }
}
</style>
