import { onMounted, onUnmounted, Ref, ref } from 'vue'

export interface IDegreeKnobOptions {
  update: (degree: number) => void
}

export interface IDegreeKnobFeature {
  knob: Ref<HTMLElement | undefined>
  onMouseDown: () => void
  onRotate: (e: MouseEvent) => void
}

interface IPosition {
  x: number
  y: number
}

export const useDegreeKnob = (options: IDegreeKnobOptions): IDegreeKnobFeature => {
  const { update } = options

  const knob = ref<HTMLElement | undefined>()
  const dragging = ref(false)
  const knobCenter = ref<IPosition>({ x: 0, y: 0 })

  const onMouseDown = () => {
    if (knob.value) {
      const { x, y, width, height } = knob.value.getBoundingClientRect()
      knobCenter.value = {
        x: x + Math.floor(width / 2),
        y: y + Math.floor(height / 2),
      }
      dragging.value = true
    }
  }

  const onMouseMove = (e: MouseEvent) => {
    if (dragging.value) {
      onRotate(e)
    }
  }

  const onRotate = (e: MouseEvent) => {
    const theta = Math.atan2(
      e.clientY - knobCenter.value.y,
      e.clientX - knobCenter.value.x,
    )
    let angle = (theta * 180) / Math.PI + 90
    if (angle < 0) {
      angle += 360
    }
    angle = Math.floor(angle)
    update(angle)
  }

  const onMouseUp = () => {
    dragging.value = false
  }

  onMounted(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  })

  return {
    knob,
    onMouseDown,
    onRotate,
  }
}
