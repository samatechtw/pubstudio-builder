<template>
  <div
    :id="treeItemId"
    ref="elementRef"
    class="component-tree-item"
    :class="{
      dragging: dndState?.dragging,
      expanded: haveChildren && expanded,
      ['hover-self']: dndState?.hoverSelf,
      ['hover-top']: dndState?.hoverTop,
      ['hover-bottom']: dndState?.hoverBottom,
    }"
    @mouseleave.stop="mouseLeave"
    @dragenter.stop="dragenter"
    @dragover.stop="dragover"
    @dragleave.stop="dragleave"
    @drop.stop="drop"
  >
    <div
      class="component-title"
      :class="{
        [`cmp-title-${level}`]: true,
        selected: currentSelected,
      }"
      :draggable="canDrag"
      @click="selectComponent"
      @mouseenter.stop="mouseEnter"
      @dragstart="dragstart"
      @drag="drag"
      @drop.stop="drop"
      @dragend="dragend"
    >
      <div v-if="haveChildren" class="caret-wrap" @click="toggleExpanded">
        <Caret class="caret" :class="{ 'caret-expanded': expanded }" />
      </div>
      <div class="component-name" :class="{ 'no-children': !haveChildren }">
        <ComponentTreeItemRename
          v-if="isBeingRenamed()"
          :component="component"
          :treeItemId="treeItemId"
          class="component-tree-item-rename"
        />
        <template v-else>
          {{ component.name }}
        </template>
      </div>
      <Hide
        v-if="editor?.componentsHidden[component.id]"
        class="eye"
        :data-tree-item-id="treeItemId"
        @click="toggleHidden"
      />
      <Eye v-else class="eye" :data-tree-item-id="treeItemId" @click="toggleHidden" />
    </div>
    <div v-if="haveChildren && expanded" class="component-children">
      <ComponentTreeItem
        v-for="(child, index) in component.children"
        :key="child.id"
        :component="child"
        :level="level + 1"
        :componentIndex="index"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { Caret } from '@pubstudio/frontend/ui-widgets'
import { IComponent } from '@pubstudio/shared/type-site'
import { findNonDynamic, useBuild, useDragDrop } from '@pubstudio/frontend/feature-build'
import {
  collapseComponentTreeItem,
  expandComponentTreeItem,
  setSelectedComponent,
  getComponentTreeItemId,
  toggleComponentHidden,
} from '@pubstudio/frontend/feature-editor'
import { Eye, Hide } from '@pubstudio/frontend/ui-widgets'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'
import ComponentTreeItemRename from './ComponentTreeItemRename.vue'

const props = defineProps<{
  component: IComponent
  level: number
  componentIndex: number
}>()

const { component, level, componentIndex } = toRefs(props)

const { site, editor } = useBuild()

const nonDynamicComponent = computed(() => findNonDynamic(component.value))
const canDrag = computed(() => !!nonDynamicComponent.value?.parent)

const mouseEnter = () => {
  runtimeContext.hoveredComponentIdInComponentTree.value = component.value.id
}

const mouseLeave = () => {
  runtimeContext.hoveredComponentIdInComponentTree.value = undefined
}

const {
  dndState,
  elementRef,
  dragstart,
  drag,
  dragenter,
  dragover,
  dragleave,
  drop,
  dragend,
} = useDragDrop({
  site: site.value,
  componentId: component.value.id,
  getParentId: () => component.value.parent?.id,
  getComponentIndex: () => componentIndex.value,
  isParent: component.value.id !== nonDynamicComponent.value?.id,
  verticalOnly: true,
  getDraggedElement: () => document.getElementById(treeItemId.value),
})

const treeItemId = computed(() => getComponentTreeItemId(component.value))

const haveChildren = computed(() => !!component.value.children?.length)

const expanded = computed(
  () => editor.value?.componentTreeExpandedItems[component.value.id],
)

const currentSelected = computed(() => {
  const { selectedComponent } = editor.value ?? {}
  return component.value.id === selectedComponent?.id
})

const toggleHidden = () => {
  toggleComponentHidden(site.value.editor, component.value.id)
}

const selectComponent = () => {
  setSelectedComponent(site.value, component.value, {
    expandTree: false,
  })
}

const toggleExpanded = () => {
  if (expanded.value) {
    collapseComponentTreeItem(site.value.editor, component.value)
  } else {
    expandComponentTreeItem(site.value.editor, component.value)
  }
}

const isBeingRenamed = () => {
  const { treeItemId: contextTreeItemId, renaming } =
    runtimeContext.componentTreeItemRenameData.value
  return renaming && contextTreeItemId === treeItemId.value
}
</script>
