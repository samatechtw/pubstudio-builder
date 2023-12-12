<template>
  <PSMultiselect
    :value="editor?.active"
    class="page-multiselect"
    :placeholder="t('history.command.changeP')"
    :options="pageOptions"
    :caret="false"
    :clearable="false"
    :tooltip="t('history.command.changeP')"
    :openControl="() => editor?.styleMenu === StyleToolbarMenu.Page"
    @select="setActivePage"
    @open="setStyleToolbarMenu(editor, StyleToolbarMenu.Page)"
    @close="setStyleToolbarMenu(editor, undefined)"
    @click.stop
  />
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { setStyleToolbarMenu } from '@pubstudio/frontend/feature-editor'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { StyleToolbarMenu } from '@pubstudio/shared/type-site'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { IMultiselectOption, IMultiselectObj } from '@pubstudio/frontend/type-ui-widgets'

const { t } = useI18n()
const { site, editor, changePage } = useBuild()

const pageOptions = computed(() =>
  Object.values(site.value.pages).map((page) => ({
    label: page.name,
    value: page.route,
  })),
)

const setActivePage = (option: IMultiselectOption | undefined) => {
  if (option) {
    const route = (option as IMultiselectObj).value as string
    if (editor.value?.active !== route) {
      changePage(route)
    }
  }
}

onMounted(() => {
  if (editor.value?.styleMenu === StyleToolbarMenu.Page) {
    setStyleToolbarMenu(editor.value, undefined)
  }
})
</script>

<style lang="postcss" scoped>
.page-multiselect {
  width: 80px;
}
</style>
