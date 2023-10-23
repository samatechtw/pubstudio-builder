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
    @click="addBuiltinComponent(builtinComponentId)"
  >
    {{ text }}
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { useDragDrop } from '../../lib/dnd/use-drag-drop'
import { useBuild } from '../../lib/use-build'
import { makeAddBuiltinComponentData } from '@pubstudio/frontend/util-command'
import { IComponent } from '@pubstudio/shared/type-site'

const props = defineProps<{
  text: string
  active?: boolean
  builtinComponentId: string
}>()

const { builtinComponentId } = toRefs(props)

const { site, editor, activePage, addBuiltinComponent } = useBuild()

const { dndState, elementRef, dragstart, drag, dragenter, dragover, dragleave, dragend } =
  useDragDrop({
    context: site.value.context,
    componentId: builtinComponentId.value,
    getParentId: () => undefined,
    getComponentIndex: () => 0,
    isParent: false,
    addData: makeAddBuiltinComponentData(
      site.value,
      builtinComponentId.value,
      activePage.value?.root as IComponent,
      editor.value?.selectedComponent?.id,
    ),
  })
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

$arrow-size: 10px;

.new-component {
  @mixin title-medium 13px;
  @mixin flex-center;
  text-align: center;
  width: 100%;
  height: 64px;
  color: $color-title;
  flex-shrink: 0;
  transition: color 0.2s;
  cursor: pointer;
  padding: 6px 6px 4px 6px;
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
