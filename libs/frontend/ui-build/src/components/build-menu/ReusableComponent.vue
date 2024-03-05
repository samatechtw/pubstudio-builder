<template>
  <div
    ref="elementRef"
    class="reusable-component"
    :class="{ dragging: dndState?.dragging }"
    :title="text"
    @click="addReusableComponent"
  >
    {{ text }}
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { useDragDrop } from '@pubstudio/frontend/feature-render-builder'
import {
  makeAddBuiltinComponentData,
  makeAddComponentFromReusableData,
} from '@pubstudio/frontend/util-command-data'
import { IComponent, IReusableComponent } from '@pubstudio/shared/type-site'

const props = defineProps<{
  reusableComponent: IReusableComponent
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

const { dndState, elementRef, dragstart, drag, dragenter, dragover, dragleave, dragend } =
  useDragDrop({
    site: site.value,
    componentId: reusableComponent.value.id,
    getParentId: () => undefined,
    getComponentIndex: () => 0,
    isParent: false,
    addData: makeAddBuiltinComponentData(
      site.value,
      reusableComponent.value.id,
      activePage.value?.root as IComponent,
      editor.value?.selectedComponent?.id,
    ),
  })
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
