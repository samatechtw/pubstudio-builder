<template>
  <PSMultiselect
    ref="multiselectRef"
    :value="modelValue"
    class="font-source-select"
    :placeholder="t('source')"
    :options="options"
    :clearable="false"
    @select="updateValue"
    @click.stop
  />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { IMultiselectObj } from '@pubstudio/frontend/type-ui-widgets'
import { ThemeFontSource } from '@pubstudio/shared/type-site'

const ThemeFontSourceValues = Object.values(ThemeFontSource)

const { t } = useI18n()

defineProps<{
  modelValue: ThemeFontSource | undefined
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ThemeFontSource): void
}>()

const multiselectRef = ref(null)

const options = computed(() =>
  ThemeFontSourceValues.map((source) => ({
    label: t(`theme.${source}`),
    value: source,
  })),
)

const updateValue = (option: IMultiselectObj) => {
  emit('update:modelValue', option.value as ThemeFontSource)
}

defineExpose({ multiselectRef })
</script>

<style lang="postcss" scoped>
.font-source-select {
  max-width: 180px;
  margin-right: 0;
}
</style>
