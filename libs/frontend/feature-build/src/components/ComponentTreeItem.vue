<template>
  <div
    :id="treeItemId"
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
      ref="elementRef"
      class="component-title"
      :class="{
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
        {{ component.name }}
      </div>
      <Eye v-if="!component.state?.hide" class="eye" />
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
} from '@pubstudio/frontend/feature-editor'
import { Eye } from '@pubstudio/frontend/ui-widgets'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'

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
  context: site.value.context,
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

const selectComponent = () => {
  setSelectedComponent(site.value.editor, component.value, {
    expandTree: false,
  })
  document.getElementById(component.value.id)?.scrollIntoView()
}

const toggleExpanded = () => {
  if (expanded.value) {
    collapseComponentTreeItem(site.value.editor, component.value)
  } else {
    expandComponentTreeItem(site.value.editor, component.value)
  }
}

// Instead of adding padding directly to the container of children, we use
// level prop to calculate padding and add it to title so that the background-color
// during hover can have the same width as the component tree.
const titlePadding = computed(() => {
  let paddingLevel = 0
  if (!haveChildren.value) {
    paddingLevel = level.value - 1
  } else {
    paddingLevel = level.value
  }
  return paddingLevel * 12
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-tree-item {
  $border-width: 2px;
  border: $border-width solid transparent;

  &.dragging {
    opacity: 0.2;
  }
  &.hover-self {
    border: $border-width solid #f82389;
  }
  &.hover-top {
    border: $border-width solid transparent;
    border-top-color: black;
  }
  &.hover-bottom {
    border: $border-width solid transparent;
    border-bottom-color: black;
  }
}

.component-title {
  @mixin flex-row;
  align-items: center;
  border: 1px solid transparent;
  height: 26px;
  padding-left: v-bind(titlePadding + 'px');
  .caret-wrap {
    @mixin flex-row;
    align-items: center;
    cursor: pointer;
    padding: 0 4px;
    height: 100%;
  }
  .caret {
    @mixin size 18px;
    transition: transform 0.2s;
    &-expanded {
      transform: rotate(90deg);
    }
  }
  &.selected {
    border-color: #3768ff;
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
}
.eye {
  @mixin size 12px;
  flex-shrink: 0;
}
.component-name {
  @mixin title-medium 13px;
  @mixin truncate;
  color: $color-text;
  user-select: none;
  &.no-children {
    padding-left: 28px;
  }
}

.expanded {
  padding-bottom: 4px;
  & + .component-tree-item {
    margin-top: -4px;
  }
}
</style>
