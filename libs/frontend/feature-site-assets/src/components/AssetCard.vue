<template>
  <div :id="asset.id" class="asset-card">
    <AssetCardImage :asset="asset" :assetUrl="assetUrl" />
    <div class="asset-info">
      <div v-if="showEdit" class="asset-name-edit">
        <STInput
          v-model="newName"
          class="edit-name"
          :maxLength="50"
          @handle-enter="updateName"
        />
        <Spinner v-if="loading" :size="6" color="#2a17d6" class="edit-spinner" />
        <div v-else class="edit-actions">
          <Check class="check-icon" @click="updateName" />
          <Cross class="x-icon" @click="showEdit = false" />
        </div>
      </div>
      <div v-else class="asset-name-wrap">
        <div
          ref="itemRef"
          class="asset-name"
          @mouseenter="nameMouseEnter"
          @mouseleave="nameMouseLeave"
          @click="showEditInput"
        >
          {{ asset.name }}
        </div>
        <Edit v-if="showEditIcon" class="edit-icon" />
        <CopyText v-else :text="assetUrl" class="copy-text" />
      </div>
      <AssetCardInfoBottom
        :asset="asset"
        :assetUrl="assetUrl"
        @delete="emit('delete')"
        @preview="emit('preview', assetUrl)"
        @replace="emit('replace')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { STInput, useKeyListener } from '@samatech/vue-components'
import { Check, CopyText, Cross, Edit, Spinner } from '@pubstudio/frontend/ui-widgets'
import { urlFromAsset } from '@pubstudio/frontend/util-asset'
import { Keys } from '@pubstudio/shared/type-site'
import { ISiteAssetViewModel } from '@pubstudio/shared/type-api-platform-site-asset'
import AssetCardInfoBottom from './AssetCardInfoBottom.vue'
import { useSiteAssets } from '../lib/use-site-assets'
import AssetCardImage from './AssetCardImage.vue'

const { updateAsset, loading } = useSiteAssets()

const { asset } = defineProps<{
  asset: ISiteAssetViewModel
}>()
const emit = defineEmits<{
  (e: 'update', asset: ISiteAssetViewModel): void
  (e: 'delete'): void
  (e: 'preview', assetUrl: string): void
  (e: 'replace'): void
}>()

const showEditIcon = ref(false)
const showEdit = ref(false)
const newName = ref('')

useKeyListener(Keys.Escape, () => {
  showEdit.value = false
})

const showEditInput = () => {
  showEdit.value = true
  newName.value = asset.name
}

const assetUrl = computed(() => {
  return urlFromAsset(asset)
})

const updateName = async () => {
  showEdit.value = false
  if (newName.value) {
    const result = await updateAsset(asset.id, { name: newName.value })
    // TODO -- check errors
    if (result) {
      emit('update', result)
    }
  }
}

const nameMouseEnter = () => {
  showEditIcon.value = true
}

const nameMouseLeave = () => {
  showEditIcon.value = false
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.asset-card {
  @mixin flex-col;
  position: relative;
  max-width: 100%;
  background-color: white;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15))
    drop-shadow(4px 8px 24px rgba(16, 3, 70, 0.05));
  border-radius: 4px;
}
.tooltip {
  @mixin tooltip;
  z-index: 10;
}
.asset-info {
  @mixin flex-col;
  padding: 0 8px 8px;
}
.asset-name-edit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0 6px;
  .x-icon,
  .check-icon {
    @mixin size 16px;
    margin-left: 8px;
    cursor: pointer;
  }
  .check-icon {
    @mixin size 22px;
  }
}
.edit-name :deep(.st-input) {
  height: 32px;
}
.edit-actions {
  @mixin flex-center;
}
.asset-name-wrap {
  display: flex;
  justify-content: space-between;
  padding: 12px 0 8px;
}
.copy-text {
  :deep(svg) {
    @mixin size 16px;
  }
}
.asset-name {
  @mixin title-medium 16px;
  @mixin truncate;
  cursor: pointer;
  color: $color-text;
}
</style>
