import { ComputedRef, Ref, computed, ref } from 'vue'
import { AdminTablePageSize } from '@pubstudio/frontend/util-fields'

export interface IUseDataTableFeature {
  page: Ref<number>
  total: Ref<number>
  pageSize: Ref<AdminTablePageSize>
  maxPage: ComputedRef<number>
  from: ComputedRef<number>
  to: ComputedRef<number>
  setPageSize: (pageSize: AdminTablePageSize) => void
}

export const useDataTable = (): IUseDataTableFeature => {
  const page = ref(1)
  const total = ref(0)
  const pageSize = ref<AdminTablePageSize>(25)

  const maxPage = computed(() => Math.ceil(total.value / (pageSize.value || 1)))

  const from = computed(() => (page.value - 1) * pageSize.value + 1)

  const to = computed(() => from.value + pageSize.value - 1)

  const setPageSize = (value: AdminTablePageSize) => {
    pageSize.value = value
    page.value = 1
  }

  return {
    page,
    total,
    pageSize,
    maxPage,
    from,
    to,
    setPageSize,
  }
}
