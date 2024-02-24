<template>
  <PSMultiselect
    :value="editor?.cssPseudoClass"
    class="style-pseudo-class"
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
import { useBuild } from '@pubstudio/frontend/feature-build'
import {
  setEditorDropdown,
  setCssPseudoClass,
} from '@pubstudio/frontend/data-access-command'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import {
  CssPseudoClass,
  CssPseudoClassValues,
  EditorDropdown,
} from '@pubstudio/shared/type-site'

const { t } = useI18n()
const { editor } = useBuild()

const updatePseudoClass = (value: CssPseudoClass | undefined) => {
  if (value) {
    setCssPseudoClass(editor.value, value)
  }
}

onMounted(() => {
  if (editor.value?.editorDropdown === EditorDropdown.PseudoClass) {
    setEditorDropdown(editor.value, undefined)
  }
})
</script>

<style lang="postcss" scoped>
.style-pseudo-class {
  width: 72px;
}
</style>
