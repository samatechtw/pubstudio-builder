<template>
  <div
    ref="elementRef"
    class="reusable-component"
    :class="{ dragging: dndState?.dragging }"
    :title="text"
    :draggable="true"
    @mouseenter.stop="mouseEnter"
    @mouseleave.stop="mouseLeave"
    @click="addReusableComponent"
    @dragstart="dragstart"
    @dragend="dragend"
    @drag="drag"
  >
    {{ text }}
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useBuild } from '@pubstudio/frontend/feature-build'
import {
  DraggedComponentAddDataType,
  useDragDrop,
} from '@pubstudio/frontend/feature-render-builder'
import {
  makeAddComponentFromReusableData,
  selectAddParent,
} from '@pubstudio/frontend/util-command-data'
import { IComponent } from '@pubstudio/shared/type-site'
import { clone } from '@pubstudio/frontend/util-component'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'

const props = defineProps<{
  reusableComponent: IComponent
}>()

const { reusableComponent } = toRefs(props)

const { site, editor, activePage, addComponentData } = useBuild()

const text = computed(() => {
  const { id, name } = reusableComponent.value
  let value = id
  if (name && id !== name) {
    value += ` (${name})`
  }
  return value
})

const addReusableComponent = () => {
  const { selectedComponent } = editor.value ?? {}
  const data = makeAddComponentFromReusableData(
    site.value,
    reusableComponent.value.id,
    selectedComponent ?? (activePage.value?.root as IComponent),
    selectedComponent?.id,
  )
  if (data) {
    addComponentData(data)
  }
}

const { dndState, elementRef, dragstart, drag, dragend } = useDragDrop({
  site: site.value,
  componentId: reusableComponent.value.id,
  getParentId: () => undefined,
  getComponentIndex: () => 0,
  isParent: false,
  addData: {
    type: DraggedComponentAddDataType.ReusableComponent,
    name: reusableComponent.value.name,
    tag: reusableComponent.value.tag,
    content: reusableComponent.value.content,
    ...selectAddParent(activePage.value?.root as IComponent, undefined),
    sourceId: undefined,
    reusableComponentId: reusableComponent.value.id,
    inputs: clone(reusableComponent.value.inputs),
    events: clone(reusableComponent.value.events),
    editorEvents: clone(reusableComponent.value.editorEvents),
    selectedComponentId: editor.value?.selectedComponent?.id,
  },
})

const mouseEnter = () => {
  runtimeContext.hoveredComponentIdInComponentTree.value = reusableComponent.value.id
}

const mouseLeave = () => {
  runtimeContext.hoveredComponentIdInComponentTree.value = undefined
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

$arrow-size: 10px;

.reusable-component {
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
