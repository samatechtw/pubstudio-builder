<template>
  <STMultiselect
    ref="multiselectRef"
    :value="newVal"
    class="style-value"
    :placeholder="t('value')"
    :options="options"
    :caret="false"
    :clearable="false"
    @select="emit('update:modelValue', $event)"
    @click.stop
  />
</template>

<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STMultiselect } from '@samatech/vue-components'

const { t } = useI18n()

const props = defineProps<{
  modelValue: string
  options: string[]
}>()

const { modelValue } = toRefs(props)

watch(modelValue, (val) => {
  newVal.value = val
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const newVal = ref(modelValue.value)

const multiselectRef = ref()

const toggleDropdown = () => {
  multiselectRef.value?.toggleDropdown()
}

defineExpose({ multiselectRef, toggleDropdown })
</script>
