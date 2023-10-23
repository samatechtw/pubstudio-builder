<template>
  <div class="gradient-degree">
    <div ref="knob" class="degree-knob" @mousedown="onMouseDown" @click="onRotate">
      <span class="degree-indicator" />
    </div>
    <input
      v-model="gradientDegree"
      class="gradient-degree-input"
      @input="onInput"
      @keydown="onKeyDown"
      @blur="onBlur"
    />
    <ColorPickerButton class="reset-gradient-degree-button" @click="onKnobRotate(0)">
      {{ t('style.toolbar.reset_degree') }}
    </ColorPickerButton>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { Keys } from '@pubstudio/frontend/util-key-listener'
import { useDegreeKnob } from '../lib/use-degree-knob'
import ColorPickerButton from './ColorPickerButton.vue'

const { t } = useI18n()

const props = defineProps<{
  degree: number
}>()

const { degree } = toRefs(props)

const emit = defineEmits<{
  (e: 'update', degree: number): void
}>()

const gradientDegree = ref(`${degree.value}°`)

const onKnobRotate = (degree: number) => {
  gradientDegree.value = `${degree}°`
  emit('update', degree)
}

const { knob, onMouseDown, onRotate } = useDegreeKnob({
  update: onKnobRotate,
})

const onInput = (e: Event) => {
  const { value } = e.target as HTMLInputElement
  const formattedValue = formatDegree(value)
  emit('update', formattedValue)
}

const onKeyDown = (e: KeyboardEvent) => {
  const { key } = e
  if (key === Keys.ArrowUp) {
    onKnobRotate((degree.value + 1) % 360)
  } else if (key === Keys.ArrowDown) {
    onKnobRotate((degree.value - 1) % 360)
  }
}

const onBlur = (e: FocusEvent) => {
  const { value } = e.target as HTMLInputElement
  const formattedValue = formatDegree(value)
  gradientDegree.value = `${formattedValue}°`
}

const formatDegree = (value: string): number => {
  const parsedValue = parseInt(value) % 360
  return isValidDegree(parsedValue) ? parsedValue : 0
}

const isValidDegree = (degree: number): boolean => {
  if (Number.isNaN(degree)) {
    return false
  } else {
    return -360 <= degree && degree <= 360
  }
}

const cssDegree = computed(() => parseInt(gradientDegree.value) + 'deg')
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.gradient-degree {
  @mixin flex-row;
  align-items: center;
  margin-top: 8px;
}
.gradient-degree-input {
  @mixin color-picker-input;
}

.degree-knob {
  @mixin size 40px;
  @mixin flex-center;
  position: relative;
  border: 3px solid white;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  transform: rotate(v-bind(cssDegree));
  .degree-indicator {
    @mixin size 6px;
    position: absolute;
    top: 4px;
    background-color: white;
    border-radius: 50%;
  }
}

.reset-gradient-degree-button {
  width: 48px;
  margin-left: 8px;
}
</style>
