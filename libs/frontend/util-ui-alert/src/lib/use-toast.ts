import { computed, ComputedRef, Ref, ref } from 'vue'

export enum ToastType {
  Toast = 'toast',
  Error = 'error',
  Hud = 'hud',
}

export interface IToastOptions {
  text: string
  type?: ToastType
  id?: string
  duration?: number
}

export interface IHUDOptions {
  text: string
  // Default 1500ms
  duration?: number
}

export interface IToast {
  text: string
  id: string
  type: ToastType
  duration?: number
  durationTimeout?: ReturnType<typeof setTimeout>
}

export interface IToastFeature {
  toasts: ComputedRef<IToast[]>
  huds: ComputedRef<IToast[]>
  addToast: (toast: IToastOptions) => void
  addHUD: (options: IHUDOptions) => void
  removeToast: (index: number) => void
}

const allToasts: Ref<IToast[]> = ref([])
let toastCount = 0

const toastById = (id: string) => {
  return allToasts.value.find((t) => t.id === id)
}
export const addToast = (toast: IToastOptions) => {
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
      allToasts.value = allToasts.value.filter((toast) => toast.id !== id)
    }, toast.duration)
  }
  allToasts.value.push({
    ...toast,
    type: toast.type ?? ToastType.Toast,
    id,
    durationTimeout,
  })
}
export const addHUD = (options: IHUDOptions) => {
  addToast({
    text: options.text,
    duration: options.duration ?? 1500,
    type: ToastType.Hud,
  })
}
export const toasts = computed(() =>
  allToasts.value.filter((t) => t.type !== ToastType.Hud),
)
export const huds = computed(() =>
  allToasts.value.filter((t) => t.type === ToastType.Hud),
)

export const removeToast = (index: number) => {
  const toast = allToasts.value.splice(index, 1)[0]
  if (toast?.durationTimeout) {
    clearTimeout(toast?.durationTimeout)
  }
}
