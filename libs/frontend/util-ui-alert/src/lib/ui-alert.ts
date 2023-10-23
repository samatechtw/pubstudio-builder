import { Ref, watch } from 'vue'

// Wait for a ref to be defined, and set it back to undefined after a duration
export const uiAlert = <T>(ref: Ref<T | undefined>): Ref<T | undefined> => {
  let alertTimer: ReturnType<typeof setTimeout> | undefined
  watch(ref, (newVal: T | undefined) => {
    if (newVal) {
      if (alertTimer) {
        clearTimeout(alertTimer)
      }
      alertTimer = setTimeout(() => {
        alertTimer = undefined
        ref.value = undefined
      }, 100)
    }
  })
  return ref
}
