<template>
  <div
    :id="builtinComponentId"
    ref="elementRef"
    class="new-component"
    :class="{ dragging: dndState?.dragging }"
    :draggable="true"
    @dragenter="dragenter"
    @dragover="dragover"
    @dragleave="dragleave"
    @dragstart="dragstart"
    @dragend="dragend"
    @drag="drag"
    @click="clickAddComponent"
  >
    {{ text }}
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { addBuiltinComponent } from '@pubstudio/frontend/feature-build'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { useDragDrop } from '@pubstudio/frontend/feature-render-builder'
import { BuilderDragDataType } from '@pubstudio/frontend/type-builder'

const props = defineProps<{
  text: string
  active?: boolean
  builtinComponentId: string
}>()

const emit = defineEmits<{
  (e: 'add', componentId: string | undefined): void
}>()

const { builtinComponentId } = toRefs(props)

const { site } = useSiteSource()

const clickAddComponent = () => {
  const componentId = addBuiltinComponent(site.value, { id: builtinComponentId.value })
  emit('add', componentId)
}

const { dndState, elementRef, dragstart, drag, dragenter, dragover, dragleave, dragend } =
  useDragDrop({
    site: site.value,
    componentId: builtinComponentId.value,
    getParentId: () => undefined,
    getComponentIndex: () => 0,
    isParent: false,
    addData: {
      id: builtinComponentId.value,
      type: BuilderDragDataType.BuiltinComponent,
    },
  })
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

$arrow-size: 10px;

.new-component {
  @mixin title-medium 13px;
  @mixin flex-center;
  line-height: 120%;
  text-align: center;
  width: 100%;
  height: 52px;
  color: $color-title;
  flex-shrink: 0;
  transition: color 0.2s;
  cursor: pointer;
  padding: 5px 6px 3px 6px;
  .caret {
    @mixin size 22px;
    visibility: hidden;
  }
  .active {
    visibility: visible;
  }
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
