<template>
  <StylePseudoClass
    :modelValue="editor?.cssPseudoClass"
    class="pseudo-class-multiselect"
    :tooltip="t('pseudo_class')"
    @update:modelValue="updatePseudoClass"
  />
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { StylePseudoClass } from '@pubstudio/frontend/ui-widgets'
import { setCssPseudoClass } from '@pubstudio/frontend/feature-editor'
import { useBuild } from '../../lib/use-build'
import { CssPseudoClass } from '@pubstudio/shared/type-site'

const { t } = useI18n()
const { editor } = useBuild()

const updatePseudoClass = (value: CssPseudoClass) => {
  setCssPseudoClass(editor.value, value)
}
</script>

<style lang="postcss" scoped>
.pseudo-class-multiselect {
  width: 72px;
}
</style>
