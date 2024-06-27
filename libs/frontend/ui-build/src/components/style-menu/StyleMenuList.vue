<template>
  <div class="style-menu-list">
    <EditMenuTitle :title="t('style.reusable')" @add="newMixin(site)" />
    <div v-if="styles.length" class="styles">
      <div
        v-for="(style, index) in styles"
        :key="style.id"
        class="style-entry edit-item"
        :class="{ dragging: newPos === index }"
        @dragenter="dragenter($event, index)"
        @dragover="dragover"
        @dragleave="dragleave"
        @drag="drag"
        @drop="drop($event, index)"
      >
        <div
          :draggable="true"
          class="drag-wrap"
          @dragstart="dragstart($event, index)"
          @dragend="dragend"
        >
          <DragVertical class="drag" />
        </div>
        <div class="style-name" @click="openMixinMenu(style.id, false)">
          {{ style.name }}
        </div>
        <Minus class="item-delete" @click="deleteStyle(style)" />
      </div>
    </div>
    <div v-else class="styles-empty">
      {{ t('style.no_styles') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { DragVertical, Minus } from '@pubstudio/frontend/ui-widgets'
import { useBuild, useMixinMenu, useMixinMenuUi } from '@pubstudio/frontend/feature-build'
import EditMenuTitle from '../EditMenuTitle.vue'
import { useListDrag } from '@pubstudio/frontend/util-doc'

const { t } = useI18n()

const { newMixin } = useMixinMenu()
const { deleteStyle, updateMixinOrder, site } = useBuild()

const { openMixinMenu } = useMixinMenuUi()

const {
  newPos,
  dragListPreview,
  dragstart,
  drag,
  dragenter,
  dragover,
  dragleave,
  drop,
  dragend,
} = useListDrag({
  dataIdentifier: 'text/style-id',
  getDragElement: (e) => (e.target as HTMLElement).parentElement,
  onDrop: (_e, dragIndex, targetIndex) => updateMixinOrder(dragIndex, targetIndex),
})

const styles = computed(() => {
  const ordered =
    site.value.context?.styleOrder
      .map((styleId) => site.value?.context.styles?.[styleId])
      .filter((id) => !!id) ?? []
  return dragListPreview(ordered)
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.styles {
  width: 100%;
}
.style-entry {
  justify-content: space-between;
  border-bottom: 1px solid $grey-100;
  cursor: default;
  padding-left: 6px;
  user-select: none;
  &.dragging {
    background-color: $grey-100;
  }
}
.style-name {
  @mixin text 14px;
  @mixin truncate;
  padding: 10px 0;
  flex-grow: 1;
  cursor: pointer;
}
.styles-empty {
  @mixin text-medium 18px;
  padding-top: 24px;
  color: $grey-500;
}
.drag {
  @mixin size 18px;
  position: relative;
  flex-shrink: 0;
  margin-right: 4px;
  left: -2px;
  cursor: pointer;
}
</style>
