<template>
  <PSMultiselect
    ref="multiselectRef"
    :value="newVal"
    class="style-pseudo-class"
    :placeholder="t('pseudo_class')"
    :options="CssPseudoClassValues"
    :caret="false"
    :clearable="false"
    :tooltip="tooltip"
    @select="emit('update:modelValue', $event)"
    @click.stop
  />
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { CssPseudoClass, CssPseudoClassValues } from '@pubstudio/shared/type-site'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    modelValue: CssPseudoClass | undefined
    tooltip?: string
  }>(),
  {
    tooltip: undefined,
  },
)

const { modelValue } = toRefs(props)

const emit = defineEmits<{
  (e: 'update:modelValue', value: CssPseudoClass): void
}>()

const newVal = ref(CssPseudoClass.Default)
const multiselectRef = ref(null)

watch(modelValue, (val) => {
  if (val) {
    newVal.value = val
  }
})

onMounted(() => {
  if (modelValue.value) {
    newVal.value = modelValue.value
  }
})

defineExpose({ multiselectRef })
</script>

<style lang="postcss" scoped></style>
