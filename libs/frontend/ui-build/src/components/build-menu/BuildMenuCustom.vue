<template>
  <div
    class="custom-menu"
    :class="{ componentDragging: !!dragSource?.componentId, customDragging }"
    @drag="drag"
    @dragover="drag"
    @dragenter="customMenuDragenter"
    @dragleave="customMenuDragleave"
    @drop="customMenuDrop"
  >
    <div class="title">
      {{ t('build.custom_components') }}
    </div>
    <div v-if="topLevelCustomComponents.length === 0" class="custom-empty">
      {{ t('build.custom_empty') }}
    </div>
    <CustomComponent
      v-for="cmp in topLevelCustomComponents"
      :key="cmp.id"
      :customComponent="cmp"
    />
    <div class="custom-fill" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { BuildSubmenu, IComponent } from '@pubstudio/shared/type-site'
import { setBuildSubmenu } from '@pubstudio/frontend/data-access-command'
import { canBecomeCustom } from '@pubstudio/frontend/util-component'
import { dragSource } from '@pubstudio/frontend/feature-render-builder'
import CustomComponent from './CustomComponent.vue'
import { getTopLevelCustomComponents } from '@pubstudio/frontend/util-builder'

const { t } = useI18n()

const { site, editor, addCustomComponent } = useBuild()
const customDragging = ref(false)
let dragLeaveTimeout: ReturnType<typeof setTimeout> | undefined = undefined

const customMenuDragleave = (_e: DragEvent) => {
  customDragging.value = false

  if (
    canBecomeCustom(site.value.context, dragSource.value?.componentId) &&
    editor.value?.buildSubmenu === BuildSubmenu.Custom
  ) {
    dragLeaveTimeout = setTimeout(() => setBuildSubmenu(editor.value, undefined), 400)
  }
}

const drag = (e: DragEvent) => {
  e.stopPropagation()
  e.preventDefault()
}

const customMenuDragenter = (e: DragEvent) => {
  e.stopPropagation()
  e.preventDefault()
  if (dragLeaveTimeout) {
    clearTimeout(dragLeaveTimeout)
  }
  if (canBecomeCustom(site.value.context, dragSource.value?.componentId)) {
    customDragging.value = true
  }
}

const customMenuDrop = (_e: DragEvent) => {
  const cmpId = dragSource.value?.componentId
  const component = resolveComponent(site.value.context, cmpId)
  if (component && canBecomeCustom(site.value.context, cmpId)) {
    addCustomComponent(component)
    if (dragLeaveTimeout) {
      clearTimeout(dragLeaveTimeout)
    }
  }
}

const topLevelCustomComponents = computed<IComponent[]>(() => {
  return getTopLevelCustomComponents(site.value.context)
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.custom-menu {
  @mixin flex-col;
  height: 100%;
  width: $left-menu-width;
  padding: 24px 0 16px;
  background-color: $blue-100;
  overflow: auto;
  &.componentDragging {
    > * {
      pointer-events: none;
    }
  }
  &.customDragging {
    border: 1.5px solid #f82389;
  }
}

.title {
  @mixin title-semibold 15px;
  padding: 0 8px;
  margin-bottom: 8px;
  pointer-events: none;
}
.custom-empty {
  @mixin title-medium 15px;
  color: $grey-500;
  padding: 16px 4px 4px 16px;
}

.custom-cmp {
  @mixin title-medium 13px;
  @mixin flex-row;
  align-items: center;
  height: 32px;
  padding: 0 8px;
  color: $color-text;
  border-top: 1px solid $border1;
  border-bottom: 1px solid $border1;
  cursor: pointer;
}
.custom-fill {
  flex-grow: 1;
  pointer-events: none;
}
</style>
