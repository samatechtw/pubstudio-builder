import { Ref, ref } from 'vue'

export enum ToastType {
  Error = 'error',
}

export interface IToastOptions {
  text: string
  type?: ToastType
  id?: string
  duration?: number
}

export interface IToast {
  text: string
  id: string
  type?: ToastType
  duration?: number
  durationTimeout?: ReturnType<typeof setTimeout>
}

export interface IToastFeature {
  toasts: Ref<IToast[]>
  addToast: (toast: IToastOptions) => void
  removeToast: (index: number) => void
}

const toasts: Ref<IToast[]> = ref([])
let toastCount = 0

export const useToast = (): IToastFeature => {
  const toastById = (id: string) => {
    return toasts.value.find((t) => t.id === id)
  }
  const addToast = (toast: IToastOptions) => {
    let durationTimeout = undefined
    let id = toast.id
    if (id) {
      // If a toast with the same ID exists, don't make a new one
      if (toastById(id)) return
    } else {
      // Generate a unique ID
      id = `__toast_${toastCount.toString()}`
      toastCount += 1
    }
    if (toast.duration) {
      // Hide the toast after a duration
      durationTimeout = setTimeout(() => {
        toasts.value = toasts.value.filter((toast) => toast.id !== id)
      }, toast.duration)
    }
    toasts.value.push({
      ...toast,
      id,
      durationTimeout,
    })
  }

  const removeToast = (index: number) => {
    const toast = toasts.value.splice(index, 1)[0]
    if (toast?.durationTimeout) {
      clearTimeout(toast?.durationTimeout)
    }
  }

  return {
    toasts,
    addToast,
    removeToast,
  }
}
