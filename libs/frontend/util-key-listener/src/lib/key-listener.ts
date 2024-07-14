import { Keys } from '@pubstudio/shared/type-site'
import { onMounted, onUnmounted } from 'vue'
import { KeyCallback } from './key-callback'

export const useKeyListener = (
  keys: Keys | Keys[],
  keyCallback: KeyCallback,
  eventType = 'keyup',
) => {
  const keyArray = Array.isArray(keys) ? keys : [keys]
  const keyStringArray = keyArray.map((k) => k.toString())

  const keyListener = (event: KeyboardEvent) => {
    if (keyStringArray.includes(event.key)) {
      keyCallback(event, keyArray)
    }
  }

  onMounted(() => {
    window.addEventListener(eventType, keyListener as EventListener)
  })

  onUnmounted(() => {
    window.removeEventListener(eventType, keyListener as EventListener)
  })
}
