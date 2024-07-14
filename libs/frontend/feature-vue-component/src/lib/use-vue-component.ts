import { ref, Ref } from 'vue'

export interface IVueComponentFeature {
  showVueComponentModal: Ref<boolean>
}

const showVueComponentModal = ref(false)

export const useVueComponent = (): IVueComponentFeature => {
  return {
    showVueComponentModal,
  }
}
