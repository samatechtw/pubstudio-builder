<template>
  <div
    :id="treeItemId"
    ref="elementRef"
    class="component-tree-item"
    :class="{
      dragging: dndState?.dragging,
      expanded: haveChildren && expanded,
    }"
    @mouseleave.stop="mouseLeave"
    @dragenter.stop="dragenter"
    @dragover.stop="dragover"
    @dragleave.stop="dragleave"
    @drop.stop="drop"
  >
    <div v-if="dndState?.hoverTop" class="hover-top hover-edge" />
    <div v-if="dndState?.hoverBottom" class="hover-bottom hover-edge" />
    <div v-if="dndState?.hoverSelf" class="hover-self hover-edge" />
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
          v-if="isRenaming"
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
import { useDragDrop } from '@pubstudio/frontend/feature-render-builder'
import { closeMixinMenuOnComponentChange } from '@pubstudio/frontend/feature-build-event'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import {
  collapseComponentTreeItem,
  expandComponentTreeItem,
  toggleComponentHidden,
  getComponentTreeItemId,
  setSelectedComponent,
} from '@pubstudio/frontend/data-access-command'
import { builderContext } from '@pubstudio/frontend/util-builder'
import { Eye, Hide } from '@pubstudio/frontend/ui-widgets'
import ComponentTreeItemRename from './ComponentTreeItemRename.vue'

const props = defineProps<{
  component: IComponent
  level: number
  componentIndex: number
}>()

const { component, level, componentIndex } = toRefs(props)

const { site, editor } = useSiteSource()

const canDrag = computed(
  () =>
    (!component.value.parent ||
      // Prevent custom instance children from being dragged.
      !component.value.parent.customSourceId) &&
    !isRenaming.value,
)

const mouseEnter = () => {
  builderContext.hoveredComponentIdInComponentTree.value = component.value.id
}

const mouseLeave = () => {
  builderContext.hoveredComponentIdInComponentTree.value = undefined
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
  isParent: false,
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
  const componentChanged = setSelectedComponent(site.value, component.value, {
    expandTree: false,
    closeMixinMenu: false,
  })
  closeMixinMenuOnComponentChange(site.value, component.value.id, componentChanged)
}

const toggleExpanded = (e: MouseEvent) => {
  const expandChildren = e.shiftKey
  if (expanded.value) {
    collapseComponentTreeItem(site.value.editor, component.value, expandChildren)
  } else {
    expandComponentTreeItem(site.value.editor, component.value, expandChildren)
  }
}

const isRenaming = computed(() => {
  const data = editor?.value?.componentTreeRenameData
  return data?.renaming && data?.itemId === treeItemId.value
})
</script>
