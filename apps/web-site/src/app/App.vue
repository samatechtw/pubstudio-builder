<template>
  <div class="app">
    <div v-if="loading" class="sw c">
      <span class="dot" />
      <span class="dot" />
      <span class="dot" />
    </div>
    <div v-else-if="error" class="emw c">
      <div class="em c">
        <span v-html="error" />
      </div>
    </div>
    <template v-else>
      <CustomStyle />
      <Mixins />
      <ComponentStyle />
      <FontLinks />
      <router-view class="_rv" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, Ref } from 'vue'
import {
  INameNavigateOptions,
  useRoute,
  useRouter,
} from '@pubstudio/frontend/util-router'
import {
  setupRoutes,
  useNotFoundPage,
  useRender,
} from '@pubstudio/frontend/feature-render'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { unstoreSite, loadSiteLanguage } from '@pubstudio/frontend/util-site-deserialize'
import { rootSiteApi } from '@pubstudio/shared/util-web-site-api'
import { ISite } from '@pubstudio/shared/type-site'
import { IGetSiteApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { overrideHelper } from '@pubstudio/frontend/util-resolve'
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
    pageOrder: serialized.pageOrder ? JSON.parse(serialized.pageOrder) : undefined,
  })
}

const activePage = computed(() => {
  const page = site.value?.pages[route.value?.path ?? '']
  return page ?? notFoundPage.value
})

const { CustomStyle, Mixins, ComponentStyle, FontLinks, PageContent } = useRender({
  site: site as Ref<ISite>,
  activePage,
  renderMode: RenderMode.Release,
  notFoundComponent: NotFound,
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
      rootSiteApi.baseUrl = `${host}/`
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
    loadSiteLanguage(userSite)
    setupRoutes(router, userSite, PageContent)
    site.value = userSite
    overrideHelper('push', (options: INameNavigateOptions) => {
      router.push(options)
    })
  }
  loading.value = false
})
</script>

<style lang="postcss">
$color-error: #ef4444;

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
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  flex-grow: 1;
}
._rc {
  flex-grow: 1;
}
.c {
  display: flex;
  justify-content: center;
  align-items: center;
}

.emw {
  width: 100%;
  height: 100%;
  padding: 16px;
}

.em {
  font-family: Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: $color-error;
  max-height: 72px;
}

.sw {
  width: 100%;
  height: 100%;
  position: absolute;
}
.dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #2a17d6;
  animation: scale 0.6s ease alternate infinite;
  &:not(:first-child) {
    margin-left: calc(32px / 4);
  }
  &:nth-of-type(2) {
    animation-delay: 0.2s;
  }
  &:nth-of-type(3) {
    animation-delay: 0.4s;
  }
}

@keyframes scale {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
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
