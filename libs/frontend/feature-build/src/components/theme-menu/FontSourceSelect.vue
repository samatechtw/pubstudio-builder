<template>
  <PSMultiselect
    ref="multiselectRef"
    :value="newVal"
    class="font-source-select"
    :placeholder="t('theme.font_source')"
    :options="options"
    :clearable="false"
    @select="updateValue"
    @click.stop
  />
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { IMultiselectObj } from '@pubstudio/frontend/type-ui-widgets'
import { ThemeFontSource, ThemeFontSourceValues } from '@pubstudio/shared/type-site'

const { t } = useI18n()

const props = defineProps<{
  modelValue: ThemeFontSource | undefined
}>()

const { modelValue } = toRefs(props)

const emit = defineEmits<{
  (e: 'update:modelValue', value: ThemeFontSource): void
}>()

const newVal = ref(modelValue.value)
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
  max-width: 160px;
  margin-right: 0;
}
</style>
