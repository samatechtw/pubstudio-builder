<template>
  <PSMultiselect
    ref="multiselectRef"
    :value="modelValue"
    class="google-font-select"
    :placeholder="t('theme.font_name')"
    :searchable="true"
    :options="GoogleFontNames"
    :clearable="false"
    :allowAny="true"
    @select="emit('update:modelValue', $event)"
    @click.stop
  />
</template>

<script lang="ts" setup>
import { ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { GoogleFontNames } from '@pubstudio/shared/type-site'

const { t } = useI18n()

const props = defineProps<{
  modelValue: string | undefined
}>()

const { modelValue } = toRefs(props)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const multiselectRef = ref(null)

defineExpose({ multiselectRef })
</script>

<style lang="postcss" scoped>
.web-safe-font-select {
  max-width: 160px;
  margin-right: 0;
}
</style>
