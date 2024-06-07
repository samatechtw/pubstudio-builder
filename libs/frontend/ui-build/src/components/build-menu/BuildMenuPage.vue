<template>
  <div class="page-menu">
    <div class="top">
      <div class="title">
        {{ t('build.pages') }}
      </div>
      <Plus class="new" @click="showCreatePage" />
    </div>
    <BuildMenuPageItem
      v-for="page in pages"
      :key="page.route"
      :text="page.route"
      :active="editor?.active === page.route"
      :editing="editingPage(page.route)"
      class="page-item"
      @click="switchPage(page.route)"
      @edit="editPage(page.route)"
    />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { setEditPage } from '@pubstudio/frontend/data-access-command'
import { resetPageMenu, useBuild, usePageMenu } from '@pubstudio/frontend/feature-build'
import { setActivePage } from '@pubstudio/frontend/data-access-command'
import { Plus } from '@pubstudio/frontend/ui-widgets'
import BuildMenuPageItem from './BuildMenuPageItem.vue'
import { EditorMode } from '@pubstudio/shared/type-site'

const { t } = useI18n()
const { editor, changePage } = useBuild()
const { pages, newPage } = usePageMenu()

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
.page-item {
  border-top: 1px solid $border1;
  &:last-child {
    border-bottom: 1px solid $border1;
  }
}
</style>
