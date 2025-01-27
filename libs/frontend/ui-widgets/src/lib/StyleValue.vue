<template>
  <STMultiselect
    ref="multiselectRef"
    :value="newVal"
    class="style-value"
    :placeholder="t('value')"
    :options="options"
    :caret="false"
    :clearable="false"
    @select="update"
    @click.stop
  />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STMultiselect } from '@samatech/vue-components'

const { t } = useI18n()

const { modelValue } = defineProps<{
  modelValue: string
  options: string[]
}>()

watch(
  () => modelValue,
  (val) => {
    newVal.value = val
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const newVal = ref(modelValue)

const multiselectRef = ref()

const toggleDropdown = () => {
  multiselectRef.value?.toggleDropdown()
}

const update = (val: string | undefined) => {
  if (val) {
    emit('update:modelValue', val)
  }
}

defineExpose({ multiselectRef, toggleDropdown })
</script>
