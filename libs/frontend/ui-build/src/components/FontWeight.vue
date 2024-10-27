<template>
  <STMultiselect
    :options="options"
    :value="fontWeight?.value"
    :placeholder="t('toolbar.font_weight')"
    :clearable="true"
    :caret="false"
    toggleId="style-menu"
    :openControl="() => editor?.editorDropdown === EditorDropdown.FontWeight"
    class="font-weight"
    @select="setStyle(Css.FontWeight, $event?.value)"
    @open="setEditorDropdown(editor, EditorDropdown.FontWeight)"
    @close="setEditorDropdown(editor, undefined)"
  />
</template>

<script lang="ts" setup>
import { computed, onMounted, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STMultiselect } from '@samatech/vue-components'
import { Css, EditorDropdown, ThemeFontSource } from '@pubstudio/shared/type-site'
import { useBuild, useToolbar } from '@pubstudio/frontend/feature-build'
import { setEditorDropdown } from '@pubstudio/frontend/data-access-command'

const { t } = useI18n()
const { site, editor } = useBuild()
const { getResolvedOrSelectedStyle, setStyle } = useToolbar()

const props = withDefaults(
  defineProps<{
    fontFamily?: string | undefined
  }>(),
  {
    fontFamily: undefined,
  },
)
const { fontFamily } = toRefs(props)

const options = computed(() => {
  let availableWeights: number[] = []
  const appliedFont = site.value.context.theme.fonts[fontFamily.value ?? '']
  const isNativeFont = appliedFont?.source === ThemeFontSource.Native

  if (isNativeFont) {
    // 100 to 900
    availableWeights = Array.from({ length: 9 }).map((_, i) => (i + 1) * 100)
  } else {
    availableWeights = [300, 400, 500, 600, 700]
  }

  return availableWeights.map((weight) => ({
    label: t(`toolbar.font_weights.${weight}`),
    value: weight.toString(),
  }))
})

const fontWeight = computed(() => {
  return getResolvedOrSelectedStyle(Css.FontWeight)
})

onMounted(() => {
  if (editor.value?.editorDropdown === EditorDropdown.FontWeight) {
    setEditorDropdown(editor.value, undefined)
  }
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.font-weight {
  width: 50%;
  margin: 0 0 0 4px;
  :deep(.multiselect-placeholder) {
    padding: 0 0 0 6px;
  }
  :deep(.multiselect-single-label) {
    padding: 0 0 0 6px;
  }
  :deep(.ms-item) {
    padding: 6px 6px 5px;
  }
  :deep(.dropdown) {
    z-index: $z-index-toolbar-dropdown1;
  }
}
</style>
