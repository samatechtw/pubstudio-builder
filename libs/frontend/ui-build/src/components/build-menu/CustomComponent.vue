<template>
  <div
    ref="elementRef"
    class="custom-component"
    :class="{ dragging: dndState?.dragging }"
    :title="text"
    :draggable="true"
    @mouseenter.stop="mouseEnter"
    @mouseleave.stop="mouseLeave"
    @click="addCustomComponent"
    @dragstart="dragstart"
    @dragend="dragend"
    @drag="drag"
  >
    {{ text }}
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import {
  addCustomComponentAtSelection,
  useBuild,
} from '@pubstudio/frontend/feature-build'
import { useDragDrop } from '@pubstudio/frontend/feature-render-builder'
import { IComponent } from '@pubstudio/shared/type-site'
import { BuilderDragDataType } from '@pubstudio/frontend/type-builder'
import { builderContext } from '@pubstudio/frontend/util-builder'

const props = defineProps<{
  customComponent: IComponent
}>()

const { customComponent } = toRefs(props)

const { site } = useBuild()

const text = computed(() => {
  const { id, name } = customComponent.value
  let value = id
  if (name && id !== name) {
    value += ` (${name})`
  }
  return value
})

const addCustomComponent = () => {
  addCustomComponentAtSelection(site.value, customComponent.value.id)
}

const { dndState, elementRef, dragstart, drag, dragend } = useDragDrop({
  site: site.value,
  componentId: customComponent.value.id,
  getParentId: () => undefined,
  getComponentIndex: () => 0,
  isParent: false,
  addData: {
    id: customComponent.value.id,
    type: BuilderDragDataType.CustomComponent,
  },
})

const mouseEnter = () => {
  builderContext.hoveredComponentIdInComponentTree.value = customComponent.value.id
}

const mouseLeave = () => {
  builderContext.hoveredComponentIdInComponentTree.value = undefined
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

$arrow-size: 10px;

.custom-component {
  @mixin title-medium 13px;
  width: 100%;
  display: block;
  align-items: center;
  padding: 8px;
  color: $color-text;
  border-top: 1px solid $border1;
  border-bottom: 1px solid $border1;
  cursor: pointer;
  transition: color 0.2s;
  word-break: break-all;
  &.dragging {
    opacity: 0.3;
  }
  &:hover {
    color: $color-toolbar-button-active;
    :deep(path) {
      fill: $color-toolbar-button-active;
    }
  }
}
</style>
