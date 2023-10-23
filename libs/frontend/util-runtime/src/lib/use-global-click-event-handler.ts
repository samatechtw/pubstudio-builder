import { onMounted, onUnmounted } from 'vue'
import { runtimeContext } from './runtime-context'

export const useGlobalClickEventHandler = (): void => {
  const globalClickEventHandler = (e: MouseEvent) => {
    Object.values(runtimeContext.eventHandlers.click).forEach((handler) => {
      handler(e)
    })
  }

  onMounted(() => {
    window.addEventListener('click', globalClickEventHandler)
  })

  onUnmounted(() => {
    window.removeEventListener('click', globalClickEventHandler)
  })
}
