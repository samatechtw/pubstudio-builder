import { debounce } from '@pubstudio/shared/util-debounce'
import { onBeforeUnmount, onMounted, Ref, ref } from 'vue'

export interface IUseWindow {
  innerWidth: Ref<number>
}

export const useWindow = (onResize?: (innerWidth: number) => void): IUseWindow => {
  const innerWidth = ref(window.innerWidth)

  const resizeDebounce = debounce(() => {
    innerWidth.value = window.innerWidth
    onResize?.(innerWidth.value)
  }, 100)

  onMounted(() => {
    resizeDebounce(window.innerWidth)
    window.addEventListener('resize', resizeDebounce)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeDebounce)
  })

  return {
    innerWidth,
  }
}
