import { IMultiselectOptions } from '@pubstudio/frontend/type-ui-widgets'
import { EditorMode, IPage, IPageMetadata } from '@pubstudio/shared/type-site'
import { useI18n } from 'petite-vue-i18n'
import { computed, ComputedRef, reactive, Ref, ref, UnwrapNestedRefs } from 'vue'
import { toggleEditorMenu } from './editor-helpers'
import { useBuild } from './use-build'

export interface IUsePageMenuFeature {
  editing: Ref<boolean>
  editingPage: UnwrapNestedRefs<IPageEdit>
  pageError: Ref<IPageError>
  pages: ComputedRef<IPage[]>
  isNew: ComputedRef<boolean>
  pageOptions: ComputedRef<IMultiselectOptions>
  clearEditingState: () => void
  newPage: () => void
  setEditingPage: (name: string) => void
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
  route: '/',
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

export const resetPageMenu = () => {
  editing.value = false
  Object.assign(editingPage, emptyPage())
  Object.assign(editingPageSource, emptyPage())
  pageError.value = getDefaultError()
}

export const usePageMenu = (): IUsePageMenuFeature => {
  const { t } = useI18n()
  const { site, editor, editPage, addPage, removePage: removePageBuild } = useBuild()

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
    toggleEditorMenu(editor.value, EditorMode.Page, true)
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

  const isNew = computed(() => {
    return !(editingPageSource.route in site.value.pages)
  })

  const pageOptions = computed<IMultiselectOptions>(() => {
    return Object.values(site.value.pages).map((page) => ({
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

      if (isNew.value) {
        addPage(newPage, editingPage.copyFrom)
      } else {
        editPage(getMetadataCopy(editingPageSource), newPage)
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
    isNew,
    pageOptions,
    clearEditingState,
    newPage,
    setEditingPage,
    savePage,
    removePage,
  }
}
