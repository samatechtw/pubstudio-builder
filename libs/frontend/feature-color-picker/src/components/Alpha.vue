<template>
  <div ref="root" class="color-alpha" @mousedown.prevent="selectAlpha">
    <canvas ref="canvasAlpha" />
    <div :style="slideAlphaStyle" class="slide" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs, watch } from 'vue'
import { createAlphaSquare, createLinearGradient } from '../lib/color-picker-util'
import { IRgba } from '../lib/i-rgba'

const props = withDefaults(
  defineProps<{
    color?: string
    rgba?: IRgba | null
    width?: number
    height?: number
  }>(),
  {
    color: '#000000',
    rgba: null,
    width: 15,
    height: 152,
  },
)
const { color, rgba, width, height } = toRefs(props)
const emit = defineEmits<{
  (e: 'selectAlpha', alpha: number): void
}>()

const slideAlphaStyle = ref<Record<string, string>>({})
const alphaSize = ref(5)
const canvasAlpha = ref()
const root = ref()

const renderColor = () => {
  const canvas = canvasAlpha.value as HTMLCanvasElement
  const canvasSquare = createAlphaSquare(alphaSize.value)
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  canvas.width = width.value
  canvas.height = height.value
  ctx.fillStyle = ctx.createPattern(canvasSquare, 'repeat') as CanvasPattern
  ctx.fillRect(0, 0, width.value, height.value)
  createLinearGradient(
    'p',
    ctx,
    width.value,
    height.value,
    'rgba(255,255,255,0)',
    color.value,
  )
}

const renderSlide = () => {
  if (rgba.value?.a) {
    slideAlphaStyle.value = {
      top: rgba.value.a * height.value - 2 + 'px',
    }
  }
}

const selectAlpha = (e: any) => {
  const { top: hueTop } = root.value?.getBoundingClientRect()
  const mousemove = (e: any) => {
    let y = e.clientY - hueTop
    if (y < 0) {
      y = 0
    }
    if (y > height.value) {
      y = height.value
    }
    let a = parseFloat((y / height.value).toFixed(2))
    emit('selectAlpha', a)
  }
  mousemove(e)
  const mouseup = () => {
    document.removeEventListener('mousemove', mousemove)
    document.removeEventListener('mouseup', mouseup)
  }
  document.addEventListener('mousemove', mousemove)
  document.addEventListener('mouseup', mouseup)
}

watch(color, renderColor)
watch(() => rgba.value?.a, renderSlide)

onMounted(() => {
  renderColor()
  renderSlide()
})
</script>

<style lang="postcss" scoped>
.color-alpha {
  position: relative;
  margin-left: 8px;
  cursor: pointer;
  .slide {
    position: absolute;
    left: 0;
    top: 100px;
    width: 100%;
    height: 4px;
    background: #fff;
    box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.3);
    pointer-events: none;
  }
}
</style>
