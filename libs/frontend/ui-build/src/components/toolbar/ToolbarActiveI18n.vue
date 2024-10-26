<template>
  <PSMultiselect
    v-if="languages.length > 1"
    :value="activeLanguage"
    class="style-i18n"
    :options="languages"
    :caret="false"
    :clearable="false"
    :tooltip="t('toolbar.i18n')"
    :openControl="() => editor?.editorDropdown === EditorDropdown.ActiveLanguage"
    @select="updateLanguage"
    @open="setEditorDropdown(editor, EditorDropdown.ActiveLanguage)"
    @close="setEditorDropdown(editor, undefined)"
    @click.stop
  />
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  setEditorDropdown,
  setActiveLanguage,
} from '@pubstudio/frontend/data-access-command'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { EditorDropdown } from '@pubstudio/shared/type-site'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import {
  DEFAULT_LANGUAGE,
  getCurrentLanguages,
} from '@pubstudio/frontend/util-site-translations'
import { IMultiselectObj } from '@pubstudio/frontend/type-ui-widgets'

const { t } = useI18n()
const { site, editor } = useSiteSource()

const languages = computed(() => {
  return getCurrentLanguages(site.value.context)
})

const activeLanguage = computed(() => {
  return editor.value?.editorI18n ?? DEFAULT_LANGUAGE
})

const updateLanguage = (value: IMultiselectObj | undefined) => {
  setActiveLanguage(site.value, value?.value as string | undefined)
}

onMounted(() => {
  if (editor.value?.editorDropdown === EditorDropdown.ActiveLanguage) {
    setEditorDropdown(editor.value, undefined)
  }
})
</script>

<style lang="postcss" scoped>
.style-i18n {
  width: 70px;
}
</style>
