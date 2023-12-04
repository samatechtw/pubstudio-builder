<template>
  <div class="component-tree-wrap" :class="{ visible: show }">
    <component :is="'style'" v-cloak>
      {{ levelStyles }}
    </component>
    <div class="component-tree">
      <ComponentTreeItem v-if="root" :component="root" :level="0" :componentIndex="0" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useBuild } from '@pubstudio/frontend/feature-build'
import ComponentTreeItem from './ComponentTreeItem.vue'
import { IComponent } from '@pubstudio/shared/type-site'

const { editor, activePage } = useBuild()

const root = computed(() => activePage.value?.root)

const show = computed(() => editor.value?.showComponentTree)

interface IterNode {
  cmp: IComponent
  depth: number
}
const makeNode = (component: IComponent, depth: number): IterNode => ({
  cmp: component,
  depth,
})

const levelStyles = computed(() => {
  const styles: string[] = []
  for (let i = 0; i <= treeDepth.value; i += 1) {
    styles.push(`.cmp-title-${i} {padding-left: ${i * 12}px;}`)
  }
  return styles.join('\n')
})

const treeDepth = computed(() => {
  const root = activePage.value?.root
  const expandedCmp = editor.value?.componentTreeExpandedItems
  if (!root || !expandedCmp) {
    return 0
  }
  let depth = 0
  // Tree iteration
  const stack = [makeNode(root, 0)]
  while (stack.length > 0) {
    const node = stack.pop()
    if (node && expandedCmp[node.cmp.id]) {
      if (node.depth > depth) {
        depth = node.depth
      }
      if (node.cmp.children) {
        stack.push(...node.cmp.children.map((c) => makeNode(c, depth + 1)))
      }
    }
  }
  return depth
})

const treeStyles = computed(() => {
  const largeTree = treeDepth.value > 5
  return largeTree
    ? {
        overflowX: 'auto',
        minWidth: 'fit-content',
        overflowName: 'visible',
      }
    : {
        overflowX: 'hidden',
        overflowName: 'hidden',
        minWidth: 'initial',
      }
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.component-tree-wrap {
  width: 0;
  max-height: $view-height;
  flex-shrink: 0;
  overflow-x: v-bind(treeStyles.overflowX);
  overflow-y: auto;
  padding-bottom: 12px;
  transition: width 0.2s;
  border-right: 1px solid $border-widget;
  &.visible {
    width: 200px;
  }
}
.component-tree {
  min-width: v-bind(treeStyles.minWidth);
}

.component-tree-item {
  $border-width: 2px;

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
  &.expanded {
    & + .component-tree-item {
      margin-top: -4px;
    }
  }
  .eye {
    @mixin size 12px;
    flex-shrink: 0;
    margin-left: 4px;
    cursor: pointer;
  }
  .component-name {
    @mixin title-medium 13px;
    @mixin truncate;
    overflow: v-bind(treeStyles.overflowName);
    color: $color-text;
    user-select: none;
    &.no-children {
      padding-left: 28px;
    }
  }
  .component-title {
    @mixin flex-row;
    align-items: center;
    border: 1px solid transparent;
    height: 26px;
    padding-right: 4px;
    .caret-wrap {
      @mixin flex-row;
      align-items: center;
      cursor: pointer;
      padding-right: 4px;
      padding-left: 4px;
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
}
</style>
