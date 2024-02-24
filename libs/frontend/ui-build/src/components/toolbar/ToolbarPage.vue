<template>
  <PSMultiselect
    :value="activePage?.route"
    :forceLabel="activePage?.name"
    class="page-multiselect"
    :placeholder="t('history.command.changeP')"
    :options="pageOptions"
    :caret="false"
    :clearable="false"
    :customSlot="true"
    :tooltip="t('history.command.changeP')"
    :openControl="() => editor?.editorDropdown === EditorDropdown.Page"
    @select="setActivePage"
    @open="setEditorDropdown(editor, EditorDropdown.Page)"
    @close="setEditorDropdown(editor, undefined)"
    @click.stop
  >
    <template #customSlot>
      <div class="ms-item add-page" @click="showNewPage">
        {{ t('history.command.addP') }}
      </div>
    </template>
  </PSMultiselect>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { EditorDropdown } from '@pubstudio/shared/type-site'
import { useBuild, usePageMenu } from '@pubstudio/frontend/feature-build'
import { setEditorDropdown } from '@pubstudio/frontend/data-access-command'
import { IMultiselectOption, IMultiselectObj } from '@pubstudio/frontend/type-ui-widgets'

const { t } = useI18n()
const { site, editor, changePage, activePage } = useBuild()
const { newPage } = usePageMenu()

const pageOptions = computed(() =>
  Object.values(site.value.pages)
    .filter((page) => page.route !== activePage.value?.route)
    .map((page) => ({
      label: page.name,
      value: page.route,
    })),
)

const showNewPage = () => {
  newPage()
}

const setActivePage = (option: IMultiselectOption | undefined) => {
  if (option) {
    const route = (option as IMultiselectObj).value as string
    if (editor.value?.active !== route) {
      changePage(route)
    }
  }
}

onMounted(() => {
  if (editor.value?.editorDropdown === EditorDropdown.Page) {
    setEditorDropdown(editor.value, undefined)
  }
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.page-multiselect {
  width: 80px;
  z-index: 2000;
  .add-page {
    background-color: $blue-100;
  }
}
</style>
