<template>
  <div class="app">
    <div id="scroll-container" class="app-content">
      <Spinner v-if="loading" class="app-spinner" />
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
import { useRoute, useRouter } from '@pubstudio/frontend/util-router'
import {
  setupRoutes,
  useNotFoundPage,
  useRender,
} from '@pubstudio/frontend/feature-render'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { unstoreSite } from '@pubstudio/frontend/util-site-deserialize'
import { rootSiteApi } from '@pubstudio/shared/util-web-site-api'
import { ISite } from '@pubstudio/shared/type-site'
import { IGetSiteApiResponse } from '@pubstudio/shared/type-api-site-sites'
import ErrorMessage from './components/ErrorMessage.vue'
import Spinner from './components/Spinner.vue'
import NotFound from './components/NotFound.vue'

const API_URL = '___SITE_API_URL___'

const router = useRouter()
const route = useRoute()

const site = ref<ISite | undefined>()
const { notFoundPage } = useNotFoundPage(site)

// Duplicate of libs/frontend/data-access-site-api/src/lib/api-site.ts to avoid pulling in deps
const getSite = async (url: string): Promise<ISite | undefined> => {
  const { data } = await rootSiteApi.request({
    url,
    method: 'GET',
    ignoreBaseUrl: true,
  })
  const serialized = data as IGetSiteApiResponse
  rootSiteApi.siteId.value = serialized.id
  return unstoreSite({
    name: serialized.name,
    version: serialized.version,
    defaults: JSON.parse(serialized.defaults),
    context: JSON.parse(serialized.context),
    pages: JSON.parse(serialized.pages),
  })
}

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
      const query = new URLSearchParams(location.search)
      const p = query.get('p')
      if (p) {
        url += `?p=${p}`
      }
      rootSiteApi.baseUrl = host
    }
    const userSite = await getSite(url)
    return userSite
  } catch (err) {
    const e = (err ?? {}) as Record<string, string>
    if ('code' in e && e.code === 'SiteUnpublished') {
      error.value = 'This site is not published.'
    } else {
      error.value = "Sorry, we're having problems loading this site."
    }
    loading.value = false
  }
}

onMounted(async () => {
  const userSite = await getUserSite()
  if (userSite) {
    setupRoutes(router, userSite, PageContent)
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

.pm-p {
  word-wrap: break-word;
  white-space: pre-wrap;
}
.pm-p::after {
  content: '\200b';
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

@media print {
  @page {
    padding: 0;
    margin: -44px 0;
    border: none;
    border-collapse: collapse;
  }
}
</style>
