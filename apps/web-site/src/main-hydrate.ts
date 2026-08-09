import {
  createStaticSiteApp,
  replaceHead,
  setupRoutes,
  StaticNotFound,
  useNotFoundPage,
} from '@pubstudio/frontend/feature-render'
import { setCssValidation } from '@pubstudio/frontend/util-render'
import { overrideHelper } from '@pubstudio/frontend/util-resolve'
import { INameNavigateOptions, IRouter } from '@pubstudio/frontend/util-router'
import { setSiteRouter } from '@pubstudio/frontend/util-runtime'
import { loadSiteLanguage, unstoreSite } from '@pubstudio/frontend/util-site-deserialize'
import { ISite, IStaticSitePayload } from '@pubstudio/shared/type-site'
import { rootSiteApi } from '@pubstudio/shared/util-web-site-api'
import { computed, createSSRApp, ref, Ref } from 'vue'
import './window-vue'

// Hydration runtime for SSG pages. The page body is already prerendered, this script reads
// the inlined site payload, rebuilds the same render tree in `static` mode, and hydrates.

declare global {
  interface Window {
    __PUBSTUDIO_SITE__?: IStaticSitePayload
    __PUBSTUDIO_SITE_API__?: string
  }
}

const setupSiteApi = (payload: IStaticSitePayload) => {
  rootSiteApi.siteId.value = payload.id
  // When absent or unreplaced, the Site API is same-origin.
  const apiUrl = window.__PUBSTUDIO_SITE_API__
  if (apiUrl && !apiUrl.startsWith('___')) {
    const apiIndex = apiUrl.indexOf('/api/')
    if (apiIndex > 0) {
      rootSiteApi.baseUrl = apiUrl.slice(0, apiIndex + 1)
    }
  } else {
    let host = `${window.location.protocol}//${window.location.hostname}`
    if (window.location.port) {
      host += `:${window.location.port}`
    }
    rootSiteApi.baseUrl = `${host}/`
  }
}

// Route resolution sets matchedRoutes in a promise callback, wait for it so
// the correct page hydrates (a NotFound flash would mismatch the markup)
const waitForRoute = async <M>(router: IRouter<M>) => {
  for (let i = 0; i < 100; i += 1) {
    if (router.route.value) {
      return
    }
    await Promise.resolve()
  }
}

const main = async () => {
  const payload = window.__PUBSTUDIO_SITE__
  if (!payload) {
    console.error('Missing site payload, hydration skipped')
    return
  }
  // Match the SSG prerender (no CSS.supports style filtering)
  setCssValidation(false)

  const router = setSiteRouter(StaticNotFound)
  router.initialize()
  setupSiteApi(payload)

  // IStaticSitePayload is the IStoredSite encoding, so it deserializes directly
  const userSite = unstoreSite(payload)
  if (!userSite) {
    console.error('Invalid site payload, hydration skipped')
    return
  }

  // Deep reactivity is needed for post-mount site mutations (language, component state).
  // `ref` unwraps the nested refs in ISite.editor.store, which widens the inferred type
  // away from ISite. This site never has an editor, so cast it back.
  const site = ref(userSite) as Ref<ISite>
  const { notFoundPage } = useNotFoundPage(site)
  const activePage = computed(() => {
    const page = site.value.pages[router.route.value?.path ?? '']
    return page ?? notFoundPage.value
  })
  const { App, render } = createStaticSiteApp(site, activePage)

  router.afterEach((newRoute, oldRoute) => {
    const page = site.value.pages[newRoute?.path ?? '']
    let oldPage = undefined
    if (oldRoute && oldRoute.name !== 'NotFound') {
      oldPage = site.value.pages[oldRoute?.path ?? '']
    }
    // The initial head is prerendered, only update it on client nav.
    if (oldPage && oldPage !== page) {
      replaceHead(site.value, page, oldPage)
    }
    if (newRoute) {
      const id = rootSiteApi.siteId.value
      rootSiteApi.request({
        url: `${rootSiteApi.baseUrl}api/sites/${id}/usage/actions/page_view`,
        method: 'POST',
        ignoreBaseUrl: true,
        data: { route: newRoute.path },
      })
    }
  })

  setupRoutes(userSite, render.PageContent)
  overrideHelper('push', (options: INameNavigateOptions) => {
    router.push(options)
  })
  await waitForRoute(router)

  createSSRApp(App).mount('#app')

  // Apply the user's stored/browser language after hydration to avoid mismatch.
  loadSiteLanguage(site.value)
}

main()
