<template>
  <div class="preview-content">
    <Spinner v-if="loading" class="preview-spinner" :size="40" color="#2a17d6" />
    <template v-else>
      <CustomStyle />
      <Mixins />
      <ComponentStyle />
      <FontLinks />
      <PageContent />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { routeToPreviewPath, useRenderPreview } from '@pubstudio/frontend/feature-preview'
import { NotFound, Spinner } from '@pubstudio/frontend/ui-widgets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import {
  setupRoutes,
  useNotFoundPage,
  replaceHead,
} from '@pubstudio/frontend/feature-render'
import { setSiteRouter } from '@pubstudio/frontend/util-runtime'

const router = setSiteRouter(NotFound, {
  pathTransform: (path: string | undefined) => {
    if (!path) {
      return path
    }
    const transformed = routeToPreviewPath(path, RenderMode.Preview).url
    return transformed
  },
})
const { site } = useSiteSource()
const { notFoundPage } = useNotFoundPage(site)

const { renderMode = RenderMode.Preview } = defineProps<{
  renderMode?: RenderMode
  loading?: boolean
}>()

let linkRewriteTimeout: ReturnType<typeof setTimeout> | undefined

router.afterEach((newRoute, oldRoute) => {
  const page = site.value?.pages[newRoute?.path?.replace('/preview', '') ?? '']
  let oldPage = undefined
  // TODO -- this is a hack to solve an issue where the NotFound route is matched before
  // the site is loaded. Ideally the site initialization should be modified to avoid this
  if (oldRoute && oldRoute.name !== 'NotFound') {
    oldPage = site.value?.pages[oldRoute?.path ?? '']
  }
  if (page && newRoute?.name !== 'NotFound') {
    const title = page.head.title ?? site.value.defaults.head.title
    page.head.title = title ? `${title} - PubStudio Preview` : 'PubStudio Preview'
    replaceHead(site.value, page, oldPage)
    // Rewrite links in prosemirror text. Wait a bit to ensure we do it after initial render
    if (linkRewriteTimeout) {
      clearTimeout(linkRewriteTimeout)
    }
    linkRewriteTimeout = setTimeout(() => {
      const linkNodes = document.querySelectorAll('.pm-p a')
      linkNodes.forEach((node) => {
        const original = node.getAttribute('href')
        if (original) {
          const previewLink = routeToPreviewPath(original, RenderMode.Preview)
          node.setAttribute('href', previewLink.url)
        }
        linkRewriteTimeout = undefined
      }, 200)
    })
  }
})

const activePage = computed(() => {
  if (!site.value) {
    return undefined
  }
  const path = router.route.value?.path.replace('/preview', '') || '/'
  const pages = site.value.pages
  if (!pages[path]) {
    return pages[site.value.defaults.homePage] ?? notFoundPage.value
  }
  return pages[path]
})

const {
  CustomStyle,
  Mixins,
  ComponentStyle,
  FontLinks,
  PageContent,
  rootComponentMinHeight,
} = useRenderPreview({
  site,
  activePage,
  renderMode: renderMode,
  notFoundComponent: NotFound,
})

onMounted(() => {
  router.initialize()
  setupRoutes(site.value, PageContent, '/preview')
})
</script>

<style lang="postcss">
.preview-content {
  display: flex;
  min-height: 100%;
  /* Page Root */
  & > :deep(div) {
    min-height: v-bind(rootComponentMinHeight) !important;
    /* Select anything that is the direct children of page root */
    & > * {
      flex-shrink: 0;
    }
  }
  .pm-p {
    word-wrap: break-word;
    white-space: pre-wrap;
  }
  .pm-p::after {
    content: '\200b';
  }
}
.preview-spinner {
  width: 100%;
  height: 100%;
  justify-content: center;
}
</style>
