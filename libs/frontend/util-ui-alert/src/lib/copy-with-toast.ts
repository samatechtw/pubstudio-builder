import { copy } from '@pubstudio/frontend/util-doc'
import { addToast, IToastOptions } from './use-toast'

export const copyWithToast = (text: string, toastOptions?: Partial<IToastOptions>) => {
  const options = { text: 'Copied', duration: 2000, id: 'ui-toast', ...toastOptions }
  copy(text)
  addToast(options)
}
