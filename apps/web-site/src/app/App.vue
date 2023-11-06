<template>
  <div class="app">
    <div id="scroll-container" class="app-content">
      <PSSpinner v-if="loading" class="app-spinner" :scale="5" color="#2a17d6" />
      <ErrorMessage v-else-if="error" class="app-error" :error="error" />
      <template v-else>
        <ReusableStyle />
        <ComponentStyle />
        <GoogleFontLink />
        <router-view class="app-router-view" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import {
  IRouteWithPathRegex,
  computeLocationParts,
  getCurrentPath,
  useRoute,
  useRouter,
} from '@pubstudio/frontend/util-router'
import { useRender } from '@pubstudio/frontend/feature-render'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { unstoreSite } from '@pubstudio/frontend/util-site-deserialize'
import { IPage, ISite } from '@pubstudio/shared/type-site'
import { IGetSiteApiResponse } from '@pubstudio/shared/type-api-site-sites'
import ErrorMessage from './components/ErrorMessage.vue'
import PSSpinner from './components/PSSpinner.vue'
import NotFound from './components/NotFound.vue'
import { rootSiteApi } from './web-site-api'

const API_URL = '___SITE_API_URL___'

const route = useRoute()
const router = useRouter()

const site = ref<ISite | undefined>()

// Duplicate of libs/frontend/data-access-site-api/src/lib/api-site.ts to avoid pulling in deps
const getSite = async (url: string): Promise<ISite | undefined> => {
  const { data } = await rootSiteApi.request({
    url,
    method: 'GET',
    ignoreBaseUrl: true,
  })
  const serialized = data as IGetSiteApiResponse
  return unstoreSite({
    name: serialized.name,
    version: serialized.version,
    defaults: JSON.parse(serialized.defaults),
    context: JSON.parse(serialized.context),
    pages: JSON.parse(serialized.pages),
  })
}

const notFoundPage = computed(() => {
  return Object.values(site.value?.pages ?? {}).find(
    (page) => page.route === '/not-found',
  )
})

const activePage = computed(() => {
  const page = site.value?.pages[route.value?.path ?? '']
  return page ?? notFoundPage.value
})

const { ReusableStyle, ComponentStyle, GoogleFontLink, PageContent } = useRender({
  site,
  activePage,
  renderMode: RenderMode.Release,
  notFoundComponent: NotFound,
  unhead: true,
})

const loading = ref(true)
const error = ref('')

const getUserSite = async () => {
  try {
    // Try to get API host from env
    let url = API_URL
    // If env isn't set, use current location
    if (url.startsWith('___')) {
      let host = `${window.location.protocol}//${window.location.hostname}`
      if (window.location.port) {
        host += `:${window.location.port}`
      }
      url = `${host}/api/sites/current`
    }
    const userSite = await getSite(url)
    return userSite
  } catch (err) {
    error.value = "Sorry, we're having problems loading this site."
    loading.value = false
  }
}

const setupRoutes = (userSite: ISite) => {
  let homePageName = ''

  const pageMap = new Map<string, IPage>()

  Object.values(userSite.pages).forEach((page) => {
    if (userSite.defaults.homePage === page.route) {
      homePageName = page.name
    }

    if (page.route === '/not-found') {
      router.overwriteRouteComponent('NotFound', PageContent)
    } else {
      router.addRoute({
        path: page.route,
        name: page.name,
        component: PageContent,
      })
    }

    pageMap.set(page.route, page)
  })

  const { pathname } = window.location
  const currentPage = pageMap.get(pathname)
  const currentPath = getCurrentPath()

  if (currentPage) {
    const route = router.findRouteByName(currentPage.name) as IRouteWithPathRegex<unknown>
    const locationParts = computeLocationParts(route, currentPath)
    router.replace({
      name: currentPage.name,
      ...locationParts,
    })
  } else if (pathname === '/') {
    // Automatically navigate users to default page if current route is '/'
    const homeRoute = router.findRouteByName(homePageName) as IRouteWithPathRegex<unknown>
    const locationParts = computeLocationParts(homeRoute, currentPath)
    router.replace({
      name: homePageName,
      ...locationParts,
    })
  } else {
    router.replace({
      path: currentPath,
    })
  }
}

onMounted(async () => {
  const userSite = await getUserSite()
  if (userSite) {
    setupRoutes(userSite)
    site.value = userSite
  }
  loading.value = false
})
</script>

<style lang="postcss">
html,
body {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  * {
    box-sizing: border-box;
  }
}

p {
  margin: 0;
}

a {
  text-decoration: none;
  color: unset;
}

.noscroll {
  overflow: hidden;
}

.clip-path {
  position: absolute;
}

#app {
  height: 100%;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  & > .app-content {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    flex-grow: 1;
    & > .app-router-view {
      flex-grow: 1;
    }
  }
  .app-spinner {
    width: 100%;
    height: 100%;
  }
  .app-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 16px;
    .error {
      padding: 0;
      font-size: 24px;
    }
    .error-icon {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
