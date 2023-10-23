import { Ref, computed, onMounted, onUnmounted, ref } from 'vue'
import { IGradientColor } from '@pubstudio/frontend/util-gradient'

export interface IGradientBarHandleOptions {
  gradientBarWidth: Ref<number>
  gradientColor: Ref<IGradientColor>
  updateStop: (stop: number) => void
  onRelease: () => void
}

export interface IGradientBarHandle {
  onMouseDown: (e: MouseEvent) => void
}

export const useGradientBarHandle = (
  options: IGradientBarHandleOptions,
): IGradientBarHandle => {
  const { gradientBarWidth, gradientColor, updateStop, onRelease } = options

  const dragStartState = ref({
    x: 0,
    stop: 0,
  })
  const dragging = ref(false)

  const pixelsPerPercentage = computed(() => gradientBarWidth.value / 100)

  const onMouseDown = (e: MouseEvent) => {
    dragStartState.value = {
      x: e.clientX,
      stop: gradientColor.value.stop,
    }
    dragging.value = true
  }

  const onMouseUp = () => {
    if (dragging.value) {
      onRelease()
    }
    dragging.value = false
  }

  const onMouseMove = (e: MouseEvent) => {
    if (dragging.value) {
      const pixelsDragged = e.clientX - dragStartState.value.x
      const draggedPercentages = Math.floor(pixelsDragged / pixelsPerPercentage.value)

      let stop = dragStartState.value.stop + draggedPercentages
      if (stop < 0) {
        stop = 0
      } else if (stop > 100) {
        stop = 100
      }

      updateStop(stop)
    }
  }

  onMounted(() => {
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
  })

  onUnmounted(() => {
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('mousemove', onMouseMove)
  })

  return {
    onMouseDown,
  }
}
