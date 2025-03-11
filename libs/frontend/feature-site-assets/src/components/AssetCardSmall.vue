<template>
  <div :id="asset.id" class="asset-card" v-bind="dndProps">
    <AssetCardImage :asset="asset" :assetUrl="assetUrl">
      <AssetCardDropdown
        :assetId="asset.id"
        class="asset-dropdown"
        @delete="emit('delete')"
        @preview="emit('preview', assetUrl)"
        @replace="emit('replace')"
      />
    </AssetCardImage>
    <div class="asset-info">
      <div class="asset-name-wrap">
        <div
          ref="itemRef"
          class="asset-name"
          @mouseenter="nameMouseEnter"
          @mouseleave="nameMouseLeave"
        >
          {{ asset.name }}
        </div>
        <Teleport to="body">
          <div
            v-if="showNameTooltip"
            ref="tooltipRef"
            class="tooltip"
            :style="tooltipStyle"
          >
            {{ asset.name }}
          </div>
        </Teleport>
        <CopyText :text="assetUrl" class="copy-text" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useTooltipDelay, useKeyListener } from '@samatech/vue-components'
import { useDragDrop } from '@pubstudio/frontend/feature-render-builder'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { CopyText } from '@pubstudio/frontend/ui-widgets'
import { isAssetDroppable, urlFromAsset } from '@pubstudio/frontend/util-asset'
import { Keys } from '@pubstudio/shared/type-site'
import {
  AssetContentType,
  ISiteAssetViewModel,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { BuilderDragDataType } from '@pubstudio/frontend/type-builder'
import AssetCardImage from './AssetCardImage.vue'
import AssetCardDropdown from './AssetCardDropdown.vue'

const { site } = useSiteSource()

const { asset } = defineProps<{
  asset: ISiteAssetViewModel
}>()
const emit = defineEmits<{
  (e: 'update', asset: ISiteAssetViewModel): void
  (e: 'delete'): void
  (e: 'preview', assetUrl: string): void
  (e: 'replace'): void
}>()

const dndProps = computed(() => {
  if (!isAssetDroppable(asset.content_type)) {
    return
  }
  let dragType: BuilderDragDataType
  if (asset.content_type === AssetContentType.Pdf) {
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
    addData: { id: assetUrl.value, type: dragType, content: asset.name },
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

const showEdit = ref(false)

useKeyListener(Keys.Escape, () => {
  showEdit.value = false
})

const assetUrl = computed(() => {
  return urlFromAsset(asset)
})

const {
  itemRef,
  tooltipMouseEnter,
  tooltipMouseLeave,
  tooltipRef,
  tooltipStyle,
  show: showNameTooltip,
} = useTooltipDelay({ placement: 'top' })

const nameMouseEnter = () => {
  if (asset.name.length > 9) {
    tooltipMouseEnter()
  }
}

const nameMouseLeave = () => {
  if (asset.name.length > 9) {
    tooltipMouseLeave()
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.asset-dropdown {
  position: absolute;
  right: 4px;
  top: 3px;
  opacity: 0;
  transition: opacity 0.25s ease;
  :deep(.dropdown-toggle) {
    @mixin size 24px;
    background: rgba(255, 255, 255, 0.5);
  }
  :deep(.toggle-icon) {
    @mixin size 24px;
  }
  :deep(.ps-dropdown-item) {
    height: 40px;
    font-size: 14px;
    padding: 0 12px;
  }
}
.asset-card {
  @mixin flex-col;
  z-index: 1;
  max-width: 100%;
  background-color: white;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15))
    drop-shadow(4px 8px 24px rgba(16, 3, 70, 0.05));
  border-radius: 4px;
  &:hover {
    .asset-dropdown {
      opacity: 1;
    }
  }
}
.tooltip {
  @mixin tooltip;
  z-index: 10;
}
.asset-image :deep(.ps-asset-image) {
  height: 100px;
  object-fit: cover;
}
.asset-info {
  @mixin flex-col;
  padding: 0 4px 4px;
}
.asset-name-wrap {
  display: flex;
  justify-content: space-between;
  padding: 8px 0 0;
}
.copy-text {
  :deep(svg) {
    @mixin size 14px;
  }
}
.asset-name {
  @mixin title 11px;
  @mixin truncate;
  position: relative;
  color: $color-text;
}
</style>
