import { setEditPage } from '@pubstudio/frontend/data-access-command'
import { IMultiselectOptions } from '@pubstudio/frontend/type-ui-widgets'
import { getOrderedPages } from '@pubstudio/frontend/util-builder'
import { IEditorContext, IPage, IPageMetadata, ISite } from '@pubstudio/shared/type-site'
import { useI18n } from 'petite-vue-i18n'
import { computed, ComputedRef, reactive, Ref, ref, UnwrapNestedRefs } from 'vue'
import { useBuild } from './use-build'

export interface IUsePageMenuFeature {
  editing: Ref<boolean>
  editingPage: UnwrapNestedRefs<IPageEdit>
  pageError: Ref<IPageError>
  pages: ComputedRef<IPage[]>
  isNew: ComputedRef<boolean>
  pageOptions: ComputedRef<IMultiselectOptions>
  setEditingPage: (site: ISite, name: string) => void
  savePage: () => void
  removePage: (name: string) => void
}

interface IPageEdit extends IPageMetadata {
  // Route of page to copy from
  copyFrom?: string
}

interface IPageError {
  name: string
  route: string
}

const getDefaultError = (): IPageError => ({ name: '', route: '' })

const emptyPage = (): IPageEdit => ({
  name: '',
  public: true,
  route: '',
  head: {},
})

const editing = ref(false)
const editingPage = reactive<IPageEdit>(emptyPage())
const editingPageSource = reactive<IPageMetadata>(emptyPage())
const pageError = ref<IPageError>(getDefaultError())

// Use this to avoid `head` being passed by reference
const getMetadataCopy = (page: IPage | IPageEdit): IPageMetadata => ({
  name: page.name,
  public: page.public,
  route: page.route,
  head: {
    ...page.head,
  },
})

export const newPage = (editor: IEditorContext | undefined) => {
  setEditPage(editor, '')
  Object.assign(editingPage, emptyPage())
  Object.assign(editingPageSource, emptyPage())
  editing.value = true
}

export const setEditingPage = (site: ISite, route: string) => {
  const page = site.pages[route]
  if (page) {
    Object.assign(editingPage, getMetadataCopy(page))
    const route = editingPage.route
    // Remove leading slash for display
    editingPage.route = route.startsWith('/') ? route.slice(1) : route

    Object.assign(editingPageSource, getMetadataCopy(page))
    editing.value = true
  }
}

export const resetPageMenu = () => {
  editing.value = false
  Object.assign(editingPage, emptyPage())
  Object.assign(editingPageSource, emptyPage())
  pageError.value = getDefaultError()
}

const routeWithInitialSlash = (route: string): string => {
  return route.startsWith('/') ? route : `/${route}`
}

export const usePageMenu = (): IUsePageMenuFeature => {
  const { t } = useI18n()
  const { site, editPage, addPage, removePage: removePageBuild } = useBuild()

  const pages = computed(() => {
    return Object.values(site.value?.pages ?? {})
  })

  const validatePage = (): boolean => {
    pageError.value = getDefaultError()

    // Route
    if (!editingPage.route) {
      pageError.value.route = t('build.page_route_required')
    }
    const newRoute = routeWithInitialSlash(editingPage.route)
    // Cannot overwrite an existing page
    if (newRoute in site.value.pages && newRoute !== editingPageSource.route) {
      pageError.value.route = t('build.page_route_unique')
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

  const isNew = computed(() => {
    return !(editingPageSource.route in site.value.pages)
  })

  const pageOptions = computed<IMultiselectOptions>(() => {
    return getOrderedPages(site.value).map((page) => ({
      label: page.name,
      value: page.route,
    }))
  })

  const savePage = () => {
    if (editing.value) {
      if (!validatePage()) {
        return
      }
      const newPage = getMetadataCopy(editingPage)
      newPage.route = routeWithInitialSlash(newPage.route)

      if (isNew.value) {
        addPage(newPage, editingPage.copyFrom)
        setEditPage(site.value.editor, newPage.route)
      } else {
        editPage(getMetadataCopy(editingPageSource), newPage)
      }
    }
    resetPageMenu()
  }

  const removePage = (name: string) => {
    removePageBuild(name)
  }

  return {
    editing,
    editingPage,
    pageError,
    pages,
    isNew,
    pageOptions,
    setEditingPage,
    savePage,
    removePage,
  }
}
