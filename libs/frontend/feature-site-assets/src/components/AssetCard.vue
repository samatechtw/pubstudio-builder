<template>
  <div :id="asset.id" class="asset-card" :class="{ small }" v-bind="dndProps">
    <div class="asset-image">
      <div v-if="asset.content_type === AssetContentType.Pdf" class="asset-preview">
        <img :src="PdfPreview" />
      </div>
      <div v-else-if="asset.content_type === AssetContentType.Wasm" class="asset-preview">
        <Wasm />
      </div>
      <div v-else-if="asset.content_type === AssetContentType.Js" class="asset-preview">
        <Javascript />
      </div>
      <PSAsset v-else :asset="assetUrl" :canPlayVideo="false" :contentHash="asset.size" />
    </div>
    <div class="asset-info">
      <div v-if="showEdit" class="asset-name-edit">
        <PSInput
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
          class="asset-name"
          @mouseenter="showEditIcon = true"
          @mouseleave="showEditIcon = false"
          @click="showEditInput"
        >
          {{ asset.name }}
        </div>
        <Edit v-if="!small && showEditIcon" class="edit-icon" />
        <CopyText v-else :text="assetUrl" class="copy-text" />
      </div>
      <AssetCardInfoBottom
        v-if="!small"
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
import { computed, ref, toRefs } from 'vue'
import { useDragDrop } from '@pubstudio/frontend/feature-render-builder'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import {
  Check,
  CopyText,
  Cross,
  Edit,
  Javascript,
  PSAsset,
  PSInput,
  Spinner,
  Wasm,
} from '@pubstudio/frontend/ui-widgets'
import { isAssetDroppable, urlFromAsset } from '@pubstudio/frontend/util-asset'
import { Keys } from '@pubstudio/shared/type-site'
import { useKeyListener } from '@pubstudio/frontend/util-key-listener'
import {
  AssetContentType,
  ISiteAssetViewModel,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { BuilderDragDataType } from '@pubstudio/frontend/type-builder'
import PdfPreview from '@frontend-assets/icon/pdf.png'
import AssetCardInfoBottom from './AssetCardInfoBottom.vue'
import { useSiteAssets } from '../lib/use-site-assets'

const { updateAsset, loading } = useSiteAssets()
const { site } = useSiteSource()

const props = defineProps<{
  asset: ISiteAssetViewModel
  small?: boolean
}>()
const emit = defineEmits<{
  (e: 'update', asset: ISiteAssetViewModel): void
  (e: 'delete'): void
  (e: 'preview', assetUrl: string): void
  (e: 'replace'): void
}>()

const { asset, small } = toRefs(props)

const dndProps = computed(() => {
  if (!small.value || !isAssetDroppable(asset.value.content_type)) {
    return
  }
  let dragType: BuilderDragDataType
  if (asset.value.content_type === AssetContentType.Pdf) {
    dragType = BuilderDragDataType.LinkAsset
  } else {
    dragType = BuilderDragDataType.ImageAsset
  }
  const dnd = useDragDrop({
    site: site.value,
    componentId: assetUrl.value,
    getParentId: () => undefined,
    getComponentIndex: () => 0,
    isParent: false,
    addData: { id: assetUrl.value, type: dragType, content: asset.value.name },
  })
  return {
    draggable: true,
    ...dnd.dndState,
    onDragstart: dnd.dragstart,
    onDrag: dnd.drag,
    onDragenter: dnd.dragenter,
    onDragover: dnd.dragover,
    onDragleave: dnd.dragleave,
    onDragend: dnd.dragend,
  }
})

const showEditIcon = ref(false)
const showEdit = ref(false)
const newName = ref('')

useKeyListener(Keys.Escape, () => {
  showEdit.value = false
})

const showEditInput = () => {
  if (!small.value) {
    showEdit.value = true
    newName.value = asset.value.name
  }
}

const assetUrl = computed(() => {
  return urlFromAsset(asset.value)
})

const updateName = async () => {
  showEdit.value = false
  if (newName.value) {
    const result = await updateAsset(asset.value.id, { name: newName.value })
    // TODO -- check errors
    if (result) {
      emit('update', result)
    }
  }
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
  &.small {
    .asset-info {
      padding: 0 4px 4px;
    }
    .asset-name-wrap {
      padding: 8px 0 0;
    }
    .asset-name {
      @mixin title 11px;
      cursor: unset;
    }
    .copy-text :deep(svg) {
      @mixin size 14px;
    }
  }
}
.asset-image :deep(.ps-asset-image) {
  height: 100px;
  object-fit: cover;
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
.edit-name :deep(.ps-input) {
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
.asset-preview {
  @mixin flex-center;
  height: 100px;
  img,
  svg {
    width: 40%;
  }
}
</style>
