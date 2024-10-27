<template>
  <STMultiselect
    ref="multiselectRef"
    :value="newVal"
    :placeholder="t('property')"
    :options="options"
    :searchable="true"
    :caret="false"
    :clearable="false"
    :openInitial="openInitial"
    @select="emit('update:modelValue', $event)"
    @click.stop
  />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STMultiselect } from '@samatech/vue-components'
import { Css } from '@pubstudio/shared/type-site'

const CssValues: Css[] = Object.values(Css).filter((css) => css !== Css.Empty)

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    modelValue: Css | undefined
    omitEditProperties?: string[]
    openInitial?: boolean
  }>(),
  {
    omitEditProperties: undefined,
  },
)

const { modelValue, omitEditProperties } = toRefs(props)

watch(modelValue, (val) => {
  newVal.value = val
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Css): void
}>()

const newVal = ref<Css | undefined>(Css.Empty)
const multiselectRef = ref(null)

const options = computed(() => {
  if (!omitEditProperties.value?.length) {
    return CssValues as string[]
  }
  return CssValues.filter((css) => !omitEditProperties.value?.includes(css))
})

defineExpose({ multiselectRef })

onMounted(() => {
  newVal.value = modelValue.value
})
</script>

<style lang="postcss" scoped></style>
