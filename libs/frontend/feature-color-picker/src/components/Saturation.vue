<template>
  <div ref="root" class="saturation" @mousedown.prevent="selectSaturation">
    <canvas ref="canvasSaturation" />
    <div :style="slideSaturationStyle" class="slide" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs } from 'vue'
import { IRgba } from '@pubstudio/frontend/util-gradient'
import { createLinearGradient } from '../lib/color-picker-util'
import { IHsv } from '../lib/i-hsv'

const props = withDefaults(
  defineProps<{
    color?: string
    hsv?: IHsv | undefined
    size?: number
  }>(),
  {
    color: '#000000',
    hsv: undefined,
    size: 152,
  },
)
const { color, hsv, size } = toRefs(props)
// Remember previous x/y selection to recalculate color
let prevX: number | undefined
let prevY: number | undefined

const emit = defineEmits<{
  (e: 'selectSaturation', saturation: IRgba): void
}>()

const slideSaturationStyle = ref<Record<string, string>>({})
const canvasSaturation = ref()
const root = ref()

const renderColor = () => {
  const canvas = canvasSaturation.value as HTMLCanvasElement
  const ctx = canvas.getContext('2d', {
    willReadFrequently: true,
  }) as CanvasRenderingContext2D
  canvas.width = size.value
  canvas.height = size.value
  ctx.fillStyle = color.value
  ctx.fillRect(0, 0, size.value, size.value)
  createLinearGradient('l', ctx, size.value, size.value, '#FFFFFF', 'rgba(255,255,255,0)')
  createLinearGradient('p', ctx, size.value, size.value, 'rgba(0,0,0,0)', '#000000')
}

const renderSlide = () => {
  if (hsv.value) {
    slideSaturationStyle.value = {
      left: hsv.value.s * size.value - 5 + 'px',
      top: (1 - hsv.value.v) * size.value - 5 + 'px',
    }
  }
}

// TODO - there must be a better way to do this in `ColorPicker.vue`
// This fixes a bug when the hue is selected and the saturation selection is unchanged,
// but the color is reset to max saturation
const recalculateSaturation = () => {
  if (prevX && prevY) {
    const ctx = (canvasSaturation.value as HTMLCanvasElement).getContext(
      '2d',
    ) as CanvasRenderingContext2D
    calculateSaturation(ctx, prevX, prevY)
  }
}

const handleMousemove = (
  e: MouseEvent,
  ctx: CanvasRenderingContext2D,
  boundingLeft: number,
  boundingTop: number,
) => {
  let x = e.clientX - boundingLeft
  let y = e.clientY - boundingTop
  calculateSaturation(ctx, x, y)
}

const calculateSaturation = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  if (x < 0) {
    x = 0
  }
  if (y < 0) {
    y = 0
  }
  if (x > size.value) {
    x = size.value
  }
  if (y > size.value) {
    y = size.value
  }
  // Do not modify the dom by monitoring data changes, otherwise when the color is #ffffff, the slide will go to the lower left corner
  slideSaturationStyle.value = {
    left: x - 5 + 'px',
    top: y - 5 + 'px',
  }
  // If you use the maximum value, the selected pixel will be empty, and the empty default is black
  const imgData = ctx.getImageData(
    Math.min(x, size.value - 1),
    Math.min(y, size.value - 1),
    1,
    1,
  )
  const [r, g, b] = imgData.data
  emit('selectSaturation', { r, g, b })
  prevX = x
  prevY = y
}

const selectSaturation = (e: MouseEvent) => {
  const { top: saturationTop, left: saturationLeft } = root.value.getBoundingClientRect()
  const ctx = (e.target as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D
  const mousemove = (moveEvent: MouseEvent) => {
    handleMousemove(moveEvent, ctx, saturationLeft, saturationTop)
  }
  handleMousemove(e, ctx, saturationLeft, saturationTop)
  const mouseup = () => {
    document.removeEventListener('mousemove', mousemove)
    document.removeEventListener('mouseup', mouseup)
  }
  document.addEventListener('mousemove', mousemove)
  document.addEventListener('mouseup', mouseup)
}

defineExpose({ renderColor, renderSlide, recalculateSaturation })

onMounted(() => {
  renderColor()
  renderSlide()
})

// Can’t monitor, otherwise the color will change when you change yourself
// watch(color, renderColor())
</script>

<style lang="postcss" scoped>
.saturation {
  position: relative;
  cursor: pointer;
  .slide {
    position: absolute;
    left: 100px;
    top: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid #fff;
    box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.3);
    pointer-events: none;
  }
}
</style>
