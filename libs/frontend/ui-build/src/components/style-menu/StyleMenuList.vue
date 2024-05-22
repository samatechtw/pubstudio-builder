<template>
  <div class="style-menu-list">
    <EditMenuTitle :title="t('style.reusable')" @add="newStyle" />
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
import { computed, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { DragVertical, Minus } from '@pubstudio/frontend/ui-widgets'
import {
  useBuild,
  useReusableStyleMenu,
  useMixinMenuUi,
} from '@pubstudio/frontend/feature-build'
import EditMenuTitle from '../EditMenuTitle.vue'

const { t } = useI18n()

const { newStyle } = useReusableStyleMenu()
const { deleteStyle, updateMixinOrder, site } = useBuild()

const { openMixinMenu } = useMixinMenuUi()

const STYLE_LIST_INDEX = 'text/style-id'
const draggingIndex = ref<number>()
const newPos = ref<number>()

const styles = computed(() => {
  const ordered =
    site.value.context?.styleOrder
      .map((styleId) => site.value?.context.styles?.[styleId])
      .filter((id) => !!id) ?? []
  if (draggingIndex.value !== undefined && newPos.value !== undefined) {
    const dragged = ordered.splice(draggingIndex.value, 1)
    if (dragged[0]) {
      ordered.splice(newPos.value, 0, dragged[0])
    }
  }
  return ordered
})

const dragstart = (e: DragEvent, index: number) => {
  e.stopPropagation()
  newPos.value = undefined
  if (e.dataTransfer) {
    const el = (e.target as HTMLElement).parentElement
    const bound = el?.getBoundingClientRect()
    // Workaround for Chrome calling `dragend` immediately after `dragstart`
    setTimeout(() => {
      draggingIndex.value = index
    }, 1)
    e.dataTransfer.setData(STYLE_LIST_INDEX, index.toString())
    e.dataTransfer.effectAllowed = 'move'
    // Set the drag image to the list parent
    if (el) {
      e.dataTransfer.setDragImage(
        el,
        e.clientX - (bound?.left ?? 0),
        e.clientY - (bound?.top ?? 0),
      )
    }
  }
}

const drag = (e: DragEvent) => {
  e.stopPropagation()
  e.preventDefault()
  // Drag updates in `dragover`
}

const dragenter = (e: DragEvent, index: number) => {
  e.stopPropagation()
  e.preventDefault()
  if (e.dataTransfer) {
    newPos.value = index
  }
}

const dragover = (e: DragEvent) => {
  e.stopPropagation()
  e.preventDefault()
  if (e.dataTransfer) {
    const isStyle = e.dataTransfer.types.includes(STYLE_LIST_INDEX)
    if (isStyle) {
      e.preventDefault()
    }
  }
}

const dragleave = (e: DragEvent) => {
  e.stopPropagation()
}

const drop = (e: DragEvent, index: number) => {
  e.stopPropagation()
  if (draggingIndex.value !== undefined) {
    updateMixinOrder(draggingIndex.value, index)
  }
  newPos.value = undefined
  draggingIndex.value = undefined
}

const dragend = (e: DragEvent) => {
  e.stopPropagation()
  newPos.value = undefined
  draggingIndex.value = undefined
}
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
