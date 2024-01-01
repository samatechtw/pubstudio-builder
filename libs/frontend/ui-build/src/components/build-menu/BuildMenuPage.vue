<template>
  <div class="page-menu">
    <div class="top">
      <div class="title">
        {{ t('build.pages') }}
      </div>
      <Plus class="new" @click="showCreatePage" />
    </div>
    <BuildMenuText
      v-for="page in pages"
      :key="page.route"
      :text="page.route"
      :active="editor?.active === page.route"
      @click="switchPage(page.route)"
    />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { toggleEditorMenu } from '@pubstudio/frontend/util-command'
import { useBuild, usePageMenu } from '@pubstudio/frontend/feature-build'
import { setActivePage } from '@pubstudio/frontend/util-command'
import { Plus } from '@pubstudio/frontend/ui-widgets'
import BuildMenuText from './BuildMenuText.vue'
import { EditorMode } from '@pubstudio/shared/type-site'

const { t } = useI18n()
const { editor, changePage } = useBuild()
const { pages, newPage, clearEditingState } = usePageMenu()

const showCreatePage = () => {
  newPage()
}

const switchPage = (route: string) => {
  clearEditingState()
  if (route !== editor.value?.active) {
    changePage(route)
    setActivePage(editor.value, route)
  }
  toggleEditorMenu(editor.value, EditorMode.Page, true)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.page-menu {
  @mixin flex-col;
  height: 100%;
  width: 120px;
  padding-top: 24px;
  background-color: $blue-100;
  box-shadow: $file-menu-shadow;
  align-items: center;
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
  > div:not(:first-child) {
    margin-top: 4px;
  }
}
</style>
