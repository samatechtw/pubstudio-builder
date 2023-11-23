<template>
  <div ref="root" class="hue" @mousedown.prevent="selectHue">
    <canvas ref="canvasHue" />
    <div :style="slideHueStyle" class="slide" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs } from 'vue'
import { IRgba } from '@pubstudio/frontend/util-gradient'
import { IHsv } from '../lib/i-hsv'

const props = withDefaults(
  defineProps<{
    hsv?: IHsv | undefined
    width?: number
    height?: number
  }>(),
  {
    hsv: undefined,
    width: 15,
    height: 152,
  },
)
const { width, height, hsv } = toRefs(props)

const emit = defineEmits<{
  (e: 'selectHue', hue: IRgba): void
}>()

const slideHueStyle = ref<Record<string, string>>({})
const canvasHue = ref()
const root = ref()

const renderColor = () => {
  canvasHue.value.width = width.value
  canvasHue.value.height = height.value
  const ctx = canvasHue.value.getContext('2d', {
    willReadFrequently: true,
  }) as CanvasRenderingContext2D
  const gradient = ctx.createLinearGradient(0, 0, 0, height.value)
  gradient.addColorStop(0, '#FF0000') // red
  gradient.addColorStop(0.17 * 1, '#FF00FF') // purple
  gradient.addColorStop(0.17 * 2, '#0000FF') // blue
  gradient.addColorStop(0.17 * 3, '#00FFFF') // green
  gradient.addColorStop(0.17 * 4, '#00FF00') // green
  gradient.addColorStop(0.17 * 5, '#FFFF00') // yellow
  gradient.addColorStop(1, '#FF0000') // red
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width.value, height.value)
}

const renderSlide = () => {
  if (hsv.value) {
    slideHueStyle.value = {
      top: (1 - hsv.value.h / 360) * height.value - 2 + 'px',
    }
  }
}

const selectHue = (e: any) => {
  const { top: hueTop } = root.value?.getBoundingClientRect()
  const ctx = e.target.getContext('2d')
  const mousemove = (e: any) => {
    let y = e.clientY - hueTop
    if (y < 0) {
      y = 0
    }
    if (y > height.value) {
      y = height.value
    }
    slideHueStyle.value = {
      top: y - 2 + 'px',
    }
    // If you use the maximum value, the selected pixel will be empty, and the empty default is black
    const imgData = ctx.getImageData(0, Math.min(y, height.value - 1), 1, 1)
    const [r, g, b] = imgData.data
    emit('selectHue', { r, g, b })
  }
  mousemove(e)
  const mouseup = () => {
    document.removeEventListener('mousemove', mousemove)
    document.removeEventListener('mouseup', mouseup)
  }
  document.addEventListener('mousemove', mousemove)
  document.addEventListener('mouseup', mouseup)
}

defineExpose({ renderSlide })

onMounted(() => {
  renderColor()
  renderSlide()
})
</script>

<style lang="postcss" scoped>
.hue {
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
