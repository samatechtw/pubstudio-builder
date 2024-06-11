<template>
  <div class="page-menu">
    <div class="top">
      <div class="title">
        {{ t('build.pages') }}
      </div>
      <Plus class="new" @click="showCreatePage" />
    </div>
    <div
      v-for="(page, index) in orderedPages"
      :key="page.route"
      class="page-item-wrap"
      :class="{ dragging: newPos === index }"
      @dragenter="dragenter($event, index)"
      @dragover="dragover"
      @dragleave="dragleave"
      @drag="drag"
      @drop="drop($event, index)"
    >
      <div class="text" @click="switchPage(page.route)">
        {{ page.route }}
      </div>
      <Caret :class="{ active: editor?.active === page.route }" class="caret" />
      <div
        v-if="!editingPage(page.route)"
        class="edit-wrap"
        @click="editPage(page.route)"
      >
        <Edit class="edit" />
      </div>
      <div
        :draggable="true"
        class="drag-wrap"
        @dragstart="dragstart($event, index)"
        @dragend="dragend"
      >
        <DragVertical class="drag" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { setEditPage } from '@pubstudio/frontend/data-access-command'
import { resetPageMenu, useBuild, usePageMenu } from '@pubstudio/frontend/feature-build'
import { setActivePage } from '@pubstudio/frontend/data-access-command'
import { Plus, Caret, Edit, DragVertical } from '@pubstudio/frontend/ui-widgets'
import { EditorMode } from '@pubstudio/shared/type-site'
import { useListDrag } from '@pubstudio/frontend/util-doc'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const { t } = useI18n()
const { site } = useSiteSource()
const { editor, changePage, updatePageOrder } = useBuild()
const { newPage } = usePageMenu()
const {
  newPos,
  dragListPreview,
  dragstart,
  drag,
  dragenter,
  dragover,
  dragleave,
  drop,
  dragend,
} = useListDrag({
  dataIdentifier: 'text/style-id',
  getDragElement: (e) => (e.target as HTMLElement).parentElement,
  onDrop: (_e, dragIndex, targetIndex) => updatePageOrder(dragIndex, targetIndex),
})

const orderedPages = computed(() => {
  const ordered =
    site.value.pageOrder
      .map((route) => site.value.pages[route])
      .filter((route) => !!route) ?? []
  return dragListPreview(ordered)
})

const showCreatePage = () => {
  newPage()
}

const switchPage = (route: string) => {
  if (route !== editor.value?.active) {
    changePage(route)
    setActivePage(editor.value, route)
  }
}

const editingPage = (route: string): boolean => {
  return editor.value?.mode === EditorMode.Page && editor.value?.editPageRoute === route
}

const editPage = (route: string) => {
  resetPageMenu()
  setEditPage(editor.value, route)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

$arrow-size: 10px;

.page-menu {
  @mixin flex-col;
  height: 100%;
  width: $left-menu-width;
  padding-top: 24px;
  background-color: $blue-100;
  box-shadow: $file-menu-shadow;
  align-items: center;

  > div:not(:first-child) {
    margin-top: 4px;
  }
}
.top {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 8px;
  margin-bottom: 8px;
}
.title {
  @mixin title-semibold 15px;
}
.new {
  @mixin size 22px;
  cursor: pointer;
}

.page-item-wrap {
  @mixin flex-row;
  width: 100%;
  padding: 0 6px 0 20px;
  position: relative;
  border-top: 1px solid $border1;
  &:last-child {
    border-bottom: 1px solid $border1;
  }
}
.text {
  @mixin title-medium 13px;
  @mixin truncate;
  margin-right: auto;
  color: $color-title;
  justify-content: flex-start;
  align-items: center;
  transition: color 0.2s;
  cursor: pointer;
  padding: 6px 6px 4px 6px;
  &:hover {
    color: $color-toolbar-button-active;
    + .caret :deep(path) {
      fill: $color-toolbar-button-active;
    }
  }
}
.caret {
  @mixin size 20px;
  visibility: hidden;
  position: absolute;
  left: 2px;
  top: 5px;
  :deep(path) {
    transition: fill 0.2s;
  }
}
.active {
  visibility: visible;
}
.edit-wrap {
  @mixin flex-center;
  margin-left: 8px;
  height: 100%;
  cursor: pointer;
  &:hover {
    .edit :deep(path) {
      stroke: $color-toolbar-button-active;
    }
  }
}
.edit {
  @mixin size 20px;
  &:deep(path) {
    transition: stroke 0.2s;
  }
}
.drag-wrap {
  display: flex;
  align-items: center;
  padding: 0 6px;
}
.drag {
  @mixin size 19px;
  flex-shrink: 0;
  cursor: pointer;
}
</style>
