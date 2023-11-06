<template>
  <div class="preview-content">
    <ReusableStyle />
    <ComponentStyle />
    <GoogleFontLink />
    <PageContent />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { useRenderPreview } from '@pubstudio/frontend/feature-preview'
import { NotFound } from '@pubstudio/frontend/ui-widgets'
import { useRootBackgroundWorkaround } from '@pubstudio/frontend/feature-render'
import { useBuild } from '../../lib/use-build'

const route = useRoute()
const { initializeBuilder, site } = useBuild()
const siteId = route.query.siteId ? route.query.siteId.toString() : undefined
// TODO -- API isn't working?
await initializeBuilder(siteId)

const notFoundPage = computed(() => {
  return Object.values(site.value?.pages ?? {}).find(
    (page) => page.route === '/not-found',
  )
})

const activePage = computed(() => {
  const path = route.path.replace('/preview', '') || '/'
  const pages = site.value.pages
  if (!pages[path]) {
    return pages[site.value.defaults.homePage] ?? notFoundPage.value
  }
  return pages[path]
})

const {
  ReusableStyle,
  ComponentStyle,
  GoogleFontLink,
  PageContent,
  rootComponentMinHeight,
} = useRenderPreview({
  site,
  activePage,
  renderMode: RenderMode.Preview,
  notFoundComponent: NotFound,
  unhead: true,
})
</script>

<style lang="postcss" scoped>
html {
  background-color: black;
}
.preview-content {
  width: 100%;
  height: 100%;
  /* Page Root */
  & > :deep(div) {
    min-height: v-bind(rootComponentMinHeight) !important;
    /* Select anything that is the direct children of page root */
    & > * {
      flex-shrink: 0;
    }
  }
}
</style>
