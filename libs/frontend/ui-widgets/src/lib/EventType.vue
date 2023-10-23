<template>
  <PSMultiselect
    ref="multiselectRef"
    :value="newVal"
    class="event-type"
    :placeholder="t('pseudo_class')"
    :options="ComponentEventTypeValues"
    :searchable="true"
    :clearable="false"
    @select="emit('update:modelValue', $event)"
    @click.stop
  />
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { ComponentEventType, ComponentEventTypeValues } from '@pubstudio/shared/type-site'

const { t } = useI18n()

const props = defineProps<{
  modelValue: ComponentEventType
}>()

const { modelValue } = toRefs(props)

watch(modelValue, (val) => {
  newVal.value = val
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: ComponentEventType): void
}>()

const newVal = ref(ComponentEventType.Click)
const multiselectRef = ref(null)

defineExpose({ multiselectRef })

onMounted(() => {
  newVal.value = modelValue.value
})
</script>

<style lang="postcss" scoped></style>
