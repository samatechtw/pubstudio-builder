import { computed, ComputedRef, Ref, ref } from 'vue'

export interface IUseEditDomains {
  updatedDomains: Ref<string[] | undefined>
  newDomain: Ref<string | undefined>
  editDomainIndex: Ref<number | undefined>
  isEditingDomain: ComputedRef<boolean>
  setCustomDomain: (index: number, domain: string | undefined) => void
}

const updatedDomains = ref()
const newDomain = ref()
const editDomainIndex = ref()

const isEditingDomain = computed(
  () => editDomainIndex.value !== undefined || newDomain.value !== undefined,
)

export const useEditDomains = () => {
  const setCustomDomain = (index: number, domain: string | undefined) => {
    if (!updatedDomains.value) {
      updatedDomains.value = [domain]

      // Add domain
    } else if (domain && index === -1) {
      updatedDomains.value.push(domain)
    } else if (domain) {
      // Replace domain
      updatedDomains.value[index] = domain
    } else {
      // Remove domain
      updatedDomains.value.splice(index, 1)
    }
    newDomain.value = undefined
    editDomainIndex.value = undefined
  }

  return {
    updatedDomains,
    newDomain,
    editDomainIndex,
    isEditingDomain,
    setCustomDomain,
  }
}
