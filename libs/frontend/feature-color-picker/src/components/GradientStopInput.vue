<template>
  <input
    class="gradient-stop-input"
    type="number"
    min="0"
    max="100"
    step="1"
    :value="gradientColor.stop"
    @input="onInput"
    @blur="emit('blur')"
  />
</template>

<script lang="ts" setup>
import { IGradientColor } from '@pubstudio/frontend/util-gradient'

defineProps<{
  gradientColor: IGradientColor
}>()

const emit = defineEmits<{
  (e: 'update', stop: number): void
  (e: 'blur'): void
}>()

const onInput = (e: Event) => {
  const { value } = e.target as HTMLInputElement
  const formattedStop = formatStop(value)
  emit('update', formattedStop)
}

const formatStop = (input: string): number => {
  let parsedInput = parseInt(input)
  if (Number.isNaN(parsedInput) || parsedInput < 0) {
    parsedInput = 0
  } else if (parsedInput > 100) {
    parsedInput = 100
  }
  return parsedInput
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.gradient-stop-input {
  @mixin color-picker-input;
}
</style>
