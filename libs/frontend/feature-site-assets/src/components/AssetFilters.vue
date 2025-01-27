<template>
  <div class="asset-filters">
    <STInput
      :modelValue="store.asset.search.value"
      :placeholder="t('search')"
      class="asset-search"
      @handle-enter="updateFilter"
      @update:modelValue="store.asset.updateSearch($event)"
    >
      <Search class="search-icon" @click="updateFilter" />
      <div @click="clearSearch">
        <Cross class="clear-icon" @click="clearSearch" />
      </div>
    </STInput>
    <STMultiselect
      :value="store.asset.contentType.value"
      valueKey="key"
      :options="Object.values(AssetContentType)"
      :clearable="true"
      :caret="true"
      :placeholder="t('assets.content_type')"
      class="asset-content-type"
      @select="updateContentType"
    />
    <STMultiselect
      v-if="sites?.length"
      :value="store.asset.siteId.value"
      valueKey="id"
      labelKey="name"
      :options="sites as any"
      :clearable="true"
      :caret="true"
      :placeholder="t('site')"
      class="asset-site"
      @select="updateSiteId($event as ISiteViewModel | undefined)"
    />
    <STMultiselect
      :value="store.asset.sort.value"
      valueKey="key"
      :options="sortOptions as any"
      :clearable="false"
      :caret="true"
      class="asset-sort"
      @select="updateSort($event as ISortOption | undefined)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'
import { STMultiselect } from '@samatech/vue-components'
import {
  AssetContentType,
  IListPlatformSiteAssetsRequest,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { Cross, Search } from '@pubstudio/frontend/ui-widgets'
import { ISiteViewModel } from '@pubstudio/shared/type-api-platform-site'
import { SortDirection } from '@pubstudio/shared/type-sort'

interface ISortOption {
  key: string
  label: string
  value: { column: string; direction: SortDirection }
}

const { t } = useI18n()

defineProps<{
  sites: ISiteViewModel[] | undefined
}>()
const emit = defineEmits<{
  (e: 'updateFilter', query: IListPlatformSiteAssetsRequest): void
}>()

const updateFilter = () => {
  const sort =
    sortOptions.value.find((o) => o.key === store.asset.sort.value) ??
    sortOptions.value[0]
  const contentType = store.asset.contentType.value || undefined
  emit('updateFilter', {
    search: store.asset.search.value || undefined,
    content_type: contentType as AssetContentType | undefined,
    site_id: store.asset.siteId.value || undefined,
    column: sort.value.column,
    direction: sort.value.direction,
  })
}

const makeSortOption = (column: string, direction: SortDirection): ISortOption => {
  const key = `${column}.${direction}`
  return {
    key,
    label: t(`assets.sort.${key}`),
    value: { column, direction },
  }
}

const sortOptions = computed(() => [
  makeSortOption('created_at', SortDirection.Desc),
  makeSortOption('created_at', SortDirection.Asc),
  makeSortOption('size', SortDirection.Desc),
  makeSortOption('size', SortDirection.Asc),
])

const updateSort = (sort: ISortOption | undefined) => {
  if (sort !== undefined) {
    store.asset.updateSort(sort.key)
    updateFilter()
  }
}

const updateContentType = (contentType: AssetContentType | undefined) => {
  store.asset.updateContentType(contentType)
  updateFilter()
}

const updateSiteId = (site: ISiteViewModel | undefined) => {
  store.asset.updateSiteId(site?.id)
  updateFilter()
}

const clearSearch = () => {
  store.asset.updateSearch('')
  updateFilter()
}

onMounted(() => {
  updateFilter()
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.asset-filters {
  display: flex;
  margin-top: 16px;
}
.asset-sort {
  margin-left: auto;
  width: 124px;
}
.asset-search {
  position: relative;
  :deep(input) {
    padding-left: 32px;
    padding-right: 28px;
    width: 200px;
  }
}
.search-icon {
  @mixin size 18px;
  position: absolute;
  left: 8px;
  top: 12px;
  cursor: pointer;
}
.clear-icon {
  @mixin size 16px;
  position: absolute;
  cursor: pointer;
  right: 8px;
  top: 12px;
}
.asset-content-type {
  margin-left: 8px;
  width: 120px;
}
.asset-site {
  margin-left: 8px;
  width: 120px;
}
@media (max-width: 640px) {
  .asset-filters {
    flex-wrap: wrap;
    justify-content: center;
  }
  .asset-search {
    width: 100%;
    margin-bottom: 12px;
    :deep(.st-input) {
      width: 100%;
    }
  }
  .asset-sort {
    margin: 0 8px;
  }
}
</style>
