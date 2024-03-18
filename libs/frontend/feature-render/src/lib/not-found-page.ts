import { IPage, ISite } from '@pubstudio/shared/type-site'
import { computed, ComputedRef, Ref } from 'vue'

export interface IUseNotFoundPage {
  notFoundPage: ComputedRef<IPage | undefined>
}

export const useNotFoundPage = (site: Ref<ISite | undefined>): IUseNotFoundPage => {
  const notFoundPage = computed(() => {
    return Object.values(site.value?.pages ?? {}).find(
      (page) => page.route === '/not-found',
    )
  })

  return {
    notFoundPage,
  }
}
