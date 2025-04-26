<template>
  <STMultiselect
    :value="editor?.cssPseudoClass"
    :placeholder="t('pseudo_class')"
    :options="CssPseudoClassValues"
    :caret="false"
    :clearable="false"
    :tooltip="t('pseudo_class')"
    :openControl="() => editor?.editorDropdown === EditorDropdown.PseudoClass"
    @select="updatePseudoClass"
    @open="setEditorDropdown(editor, EditorDropdown.PseudoClass)"
    @close="setEditorDropdown(editor, undefined)"
    @click.stop
  />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STMultiselect } from '@samatech/vue-components'
import {
  setEditorDropdown,
  setCssPseudoClass,
} from '@pubstudio/frontend/data-access-command'
import { CssPseudoClass, EditorDropdown } from '@pubstudio/shared/type-site'
import { CssPseudoClassValues } from '@pubstudio/frontend/util-builder'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const { t } = useI18n()
const { site, editor } = useSiteSource()

const updatePseudoClass = (value: CssPseudoClass | undefined) => {
  if (value) {
    setCssPseudoClass(site.value, value)
  }
}

onMounted(() => {
  if (editor.value?.editorDropdown === EditorDropdown.PseudoClass) {
    setEditorDropdown(editor.value, undefined)
  }
})
</script>
