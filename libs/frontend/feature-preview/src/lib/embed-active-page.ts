import { useNotFoundPage } from '@pubstudio/frontend/feature-render'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { IPage } from '@pubstudio/shared/type-site'
import { computed, ComputedRef, ref } from 'vue'

export interface IUseEmbedActivePage {
  activePage: ComputedRef<IPage | undefined>
}

const activePath = ref<string | undefined>()

export const getActivePath = () => {
  return activePath.value
}

export const setActivePath = (path: string | undefined) => {
  activePath.value = path
}

export const useEmbedActivePage = (): IUseEmbedActivePage => {
  const { site } = useSiteSource()
  const { notFoundPage } = useNotFoundPage(site)

  const activePage = computed(() => {
    if (!site.value) {
      return undefined
    }
    const pages = site.value.pages
    const path = activePath.value
    if (!path || !pages[path]) {
      return pages[site.value.defaults.homePage] ?? notFoundPage.value
    }
    return pages[path]
  })

  return { activePage }
}
