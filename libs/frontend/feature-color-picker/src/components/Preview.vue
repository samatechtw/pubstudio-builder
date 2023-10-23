<template>
  <canvas ref="canvasRef" />
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs, watch } from 'vue'
import { createAlphaSquare } from '../lib/color-picker-util'

const props = withDefaults(
  defineProps<{
    color?: string
    width?: number
    height?: number
  }>(),
  {
    color: '#000000',
    width: 100,
    height: 30,
  },
)
const { width, height, color } = toRefs(props)

const canvasRef = ref()

const renderColor = () => {
  const canvas = canvasRef.value
  const size = 5
  const canvasSquare = createAlphaSquare(size)
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  canvas.width = width.value
  canvas.height = height.value
  ctx.fillStyle = ctx.createPattern(canvasSquare, 'repeat') as CanvasPattern
  ctx.fillRect(0, 0, width.value, height.value)
  ctx.fillStyle = color.value
  ctx.fillRect(0, 0, width.value, height.value)
}

watch(color, renderColor)

onMounted(() => {
  renderColor()
})
</script>
