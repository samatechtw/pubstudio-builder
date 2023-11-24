<template>
  <PSMultiselect
    ref="multiselectRef"
    :value="newVal"
    class="style-property"
    :placeholder="t('property')"
    :options="CssValues"
    :searchable="true"
    :caret="false"
    :clearable="false"
    :openInitial="openInitial"
    @select="emit('update:modelValue', $event)"
    @click.stop
  />
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { Css, CssValues } from '@pubstudio/shared/type-site'

const { t } = useI18n()

const props = defineProps<{
  modelValue: Css | undefined
  openInitial?: boolean
}>()

const { modelValue } = toRefs(props)

watch(modelValue, (val) => {
  newVal.value = val
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Css): void
}>()

const newVal = ref<Css | undefined>(Css.Empty)
const multiselectRef = ref(null)

defineExpose({ multiselectRef })

onMounted(() => {
  newVal.value = modelValue.value
})
</script>

<style lang="postcss" scoped></style>
