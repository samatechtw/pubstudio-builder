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
      <PSButton
        v-if="siteStore.siteId.value !== 'scratch'"
        class="add-button"
        size="small"
        @click="emit('showCreate')"
      >
        <div class="button-content">
          <Plus color="white" plusColor="#6a5cf5" class="button-plus" />
          {{ t('add') }}
        </div>
      </PSButton>
    </div>
    <div class="asset-list">
      <PSSpinner v-if="loadingAssets" class="assets-spinner" :scale="2" color="#2a17d6" />
      <div v-if="assets?.length === 0" class="assets-empty">
        {{ t('assets.no_assets') }}
      </div>
      <AssetCard
        v-for="(asset, index) in assets"
        :key="asset.id"
        :asset="asset"
        :small="true"
        class="asset-card"
        :style="{ 'z-index': (assets?.length ?? 1) - index }"
        @update="updateAssetList"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { PSButton, PSSpinner, Plus } from '@pubstudio/frontend/ui-widgets'
import { useSiteAssets, AssetCard } from '@pubstudio/frontend/feature-site-assets'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

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
  width: 200px;
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
  justify-content: space-between;
  width: 100%;
  padding: 0 8px 0 16px;
}
.asset-title {
  @mixin title-semibold 18px;
  color: $color-text;
}
.add-button {
  padding: 0 12px 0 8px;
  min-width: 0;
  margin-left: 8px;
}
.button-content {
  @mixin flex-row;
  align-items: center;
}
.button-plus {
  @mixin size 18px;
  margin-right: 6px;
}
.assets-empty {
  padding: 12px 0 4px 12px;
}
</style>
