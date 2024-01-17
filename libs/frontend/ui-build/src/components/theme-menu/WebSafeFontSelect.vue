<template>
  <PSMultiselect
    ref="multiselectRef"
    :value="modelValue"
    class="web-safe-font-select"
    :placeholder="t('theme.font_name')"
    :options="WebSafeFontValues"
    :clearable="false"
    :customLabel="true"
    @select="emit('update:modelValue', $event)"
    @click.stop
  >
    <template #default="{ label }">
      <div :style="{ 'font-family': quotedFont(label) }">
        {{ label }}
      </div>
    </template>
  </PSMultiselect>
</template>

<script lang="ts" setup>
import { ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { WebSafeFont, WebSafeFontValues } from '@pubstudio/shared/type-site'

const { t } = useI18n()

const props = defineProps<{
  modelValue: string | undefined
  searchable?: boolean
}>()

const { modelValue } = toRefs(props)

const emit = defineEmits<{
  (e: 'update:modelValue', value: WebSafeFont): void
}>()

const multiselectRef = ref(null)

const quotedFont = (fontName: string) => `"${fontName}"`

defineExpose({ multiselectRef })
</script>

<style lang="postcss" scoped>
.web-safe-font-select {
  max-width: 180px;
  margin-right: 0;
}
</style>
