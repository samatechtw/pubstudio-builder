import { IPage, IPageMetadata } from '@pubstudio/shared/type-site'
import { useI18n } from 'petite-vue-i18n'
import { computed, ComputedRef, reactive, Ref, ref, UnwrapNestedRefs } from 'vue'
import { useBuild } from './use-build'

export interface IUsePageMenuFeature {
  editing: Ref<boolean>
  editingPage: UnwrapNestedRefs<IPageMetadata>
  pageError: Ref<IPageError>
  pages: ComputedRef<IPage[]>
  clearEditingState: () => void
  newPage: () => void
  setEditingPage: (name: string) => void
  savePage: () => void
  removePage: (name: string) => void
}

interface IPageError {
  name: string
  route: string
}

const getDefaultError = (): IPageError => ({ name: '', route: '' })

const emptyPage = (): IPageMetadata => ({
  name: '',
  public: true,
  route: '/',
  head: {},
})

const editing = ref(false)
const editingPage = reactive<IPageMetadata>(emptyPage())
const editingPageSource = reactive<IPageMetadata>(emptyPage())
const pageError = ref<IPageError>(getDefaultError())

// Use this to avoid `head` being passed by reference
const getMetadataCopy = (page: IPage | IPageMetadata): IPageMetadata => ({
  name: page.name,
  public: page.public,
  route: page.route,
  head: {
    ...page.head,
  },
})

export const resetPageMenu = () => {
  editing.value = false
  Object.assign(editingPage, emptyPage())
  Object.assign(editingPageSource, emptyPage())
  pageError.value = getDefaultError()
}

export const usePageMenu = (): IUsePageMenuFeature => {
  const { t } = useI18n()
  const { site, editPage, addPage, removePage: removePageBuild } = useBuild()

  const pages = computed(() => {
    return Object.values(site.value?.pages ?? {})
  })

  const clearEditingState = () => {
    Object.assign(editingPage, emptyPage())
    Object.assign(editingPageSource, emptyPage())
    pageError.value = getDefaultError()
    editing.value = false
  }

  const newPage = () => {
    Object.assign(editingPage, emptyPage())
    Object.assign(editingPageSource, emptyPage())
    editing.value = true
  }

  const setEditingPage = (route: string) => {
    const page = site.value.pages[route]
    if (page) {
      Object.assign(editingPage, getMetadataCopy(page))
      Object.assign(editingPageSource, getMetadataCopy(page))
      editing.value = true
    }
  }

  const validatePage = (): boolean => {
    pageError.value = getDefaultError()

    // Route
    if (!editingPage.route) {
      pageError.value.route = t('build.page_route_required')
    }
    // Cannot overwrite an existing page
    if (
      editingPage.route in site.value.pages &&
      editingPage.route !== editingPageSource.route
    ) {
      pageError.value.route = t('build.page_route_unique')
    } else if (!editingPage.route.startsWith('/')) {
      pageError.value.route = t('build.page_route_format')
    }

    // Name
    if (!editingPage.name) {
      pageError.value.name = t('build.page_name_required')
    }
    const pageWithSameRoute = pages.value.find((page) => page.name === editingPage.name)
    if (
      editingPage.name === pageWithSameRoute?.name &&
      editingPage.name !== editingPageSource.name
    ) {
      pageError.value.name = t('build.page_name_unique')
    }

    return !pageError.value.name && !pageError.value.route
  }

  const savePage = () => {
    if (editing.value) {
      if (!validatePage()) {
        return
      }
      const newPage = getMetadataCopy(editingPage)

      if (editingPageSource.route in site.value.pages) {
        editPage(getMetadataCopy(editingPageSource), newPage)
      } else {
        addPage(newPage)
      }
    }
    clearEditingState()
  }

  const removePage = (name: string) => {
    removePageBuild(name)
  }

  return {
    editing,
    editingPage,
    pageError,
    pages,
    clearEditingState,
    newPage,
    setEditingPage,
    savePage,
    removePage,
  }
}
