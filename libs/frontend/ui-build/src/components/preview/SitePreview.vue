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
import { setupRoutes, useNotFoundPage } from '@pubstudio/frontend/feature-render'
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
