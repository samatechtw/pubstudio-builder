<template>
  <PSMultiselect
    :value="editor?.cssPseudoClass"
    class="style-pseudo-class"
    :placeholder="t('pseudo_class')"
    :options="CssPseudoClassValues"
    :caret="false"
    :clearable="false"
    :tooltip="t('pseudo_class')"
    :openControl="() => editor?.styleMenu === StyleToolbarMenu.PseudoClass"
    @select="updatePseudoClass"
    @open="setStyleToolbarMenu(editor, StyleToolbarMenu.PseudoClass)"
    @close="setStyleToolbarMenu(editor, undefined)"
    @click.stop
  />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { setStyleToolbarMenu, setCssPseudoClass } from '@pubstudio/frontend/util-command'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import {
  CssPseudoClass,
  CssPseudoClassValues,
  StyleToolbarMenu,
} from '@pubstudio/shared/type-site'

const { t } = useI18n()
const { editor } = useBuild()

const updatePseudoClass = (value: CssPseudoClass | undefined) => {
  if (value) {
    setCssPseudoClass(editor.value, value)
  }
}

onMounted(() => {
  if (editor.value?.styleMenu === StyleToolbarMenu.PseudoClass) {
    setStyleToolbarMenu(editor.value, undefined)
  }
})
</script>

<style lang="postcss" scoped>
.style-pseudo-class {
  width: 72px;
}
</style>
