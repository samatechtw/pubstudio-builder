<template>
  <STMultiselect
    v-slot="{ label }"
    :customLabel="true"
    :value="undefined"
    :placeholder="t('toolbar.font_family')"
    :options="options"
    :caret="false"
    toggleId="theme-variable-edit"
    :emptyText="t('theme.select_font')"
    class="font-family-select"
    @select="setFontFamily"
    @open="emit('open')"
  >
    <div :style="{ 'font-family': font(label) }">
      {{ label }}
    </div>
  </STMultiselect>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STMultiselect } from '@samatech/vue-components'
import { useBuild } from '@pubstudio/frontend/feature-build'

const { t } = useI18n()
const { site } = useBuild()

const emit = defineEmits<{
  (e: 'select', font: string | undefined): void
  (e: 'open'): void
}>()

const options = computed(() => {
  return Object.keys(site.value.context.theme.fonts)
})

const setFontFamily = (family: string | undefined) => {
  const fallback = family ? site.value.context.theme.fonts[family]?.fallback : undefined
  const font = fallback ? `${family}, ${fallback}` : family
  emit('select', font)
}

const font = (label: string) => {
  return `"${label}"`
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.font-family-select {
  @mixin title-medium 13px;
  width: 110px;
  margin: 0 0 0 4px;
  :deep(.multiselect-placeholder) {
    padding: 0 0 0 6px;
  }
  :deep(.multiselect-single-label) {
    padding: 0 0 0 6px;
  }
}
</style>
