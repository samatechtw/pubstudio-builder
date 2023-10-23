<template>
  <PSMultiselect
    :options="options"
    :value="fontWeight"
    :placeholder="t('style.toolbar.font_weight')"
    :clearable="true"
    :caret="false"
    toggleId="style-menu"
    :openControl="() => editor?.styleMenu === StyleToolbarMenu.FontWeight"
    class="font-weight"
    @select="setStyle(Css.FontWeight, $event?.value)"
    @open="setStyleToolbarMenu(editor, StyleToolbarMenu.FontWeight)"
    @close="setStyleToolbarMenu(editor, undefined)"
  />
</template>

<script lang="ts" setup>
import { computed, onMounted, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { Css, StyleToolbarMenu, ThemeFontSource } from '@pubstudio/shared/type-site'
import { setStyleToolbarMenu } from '@pubstudio/frontend/feature-editor'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '../lib/use-build'
import { useToolbar } from '../lib/use-toolbar'

const { t } = useI18n()
const { site, editor } = useBuild()
const { getStyleValue, setStyle } = useToolbar()

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
    availableWeights = [300, 400, 500, 700]
  }

  return availableWeights.map((weight) => ({
    label: t(`style.toolbar.font_weights.${weight}`),
    value: weight.toString(),
  }))
})

const fontWeight = computed(() => {
  return getStyleValue(Css.FontWeight)
})

onMounted(() => {
  if (editor.value?.styleMenu === StyleToolbarMenu.FontWeight) {
    setStyleToolbarMenu(editor.value, undefined)
  }
})
</script>

<style lang="postcss" scoped>
.font-weight {
  width: 104px;
  margin: 0 0 0 4px;
  :deep(.multiselect-placeholder) {
    padding: 0 0 0 6px;
  }
  :deep(.multiselect-single-label) {
    padding: 0 0 0 6px;
  }
}
</style>
