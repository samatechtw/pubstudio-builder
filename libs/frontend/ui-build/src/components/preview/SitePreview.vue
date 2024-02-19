<template>
  <div class="preview-content">
    <ReusableStyle />
    <ComponentStyle />
    <GoogleFontLink />
    <PageContent />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { useRenderPreview } from '@pubstudio/frontend/feature-preview'
import { NotFound } from '@pubstudio/frontend/ui-widgets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { initializeSiteStore } from '@pubstudio/frontend/feature-site-store-init'
import { useBuild } from '@pubstudio/frontend/feature-build'

const emit = defineEmits<{
  (e: 'unauthorized'): void
}>()

const route = useRoute()
const { site } = useBuild()
const { checkOutdated } = useSiteSource()
const siteId = route.query.siteId ? route.query.siteId.toString() : undefined
let checkInterval: ReturnType<typeof setInterval> | undefined
// TODO -- API isn't working?
try {
  await initializeSiteStore({ siteId })
} catch (err) {
  const e = err as Record<string, unknown>
  if ('status' in e && e.status === 401) {
    emit('unauthorized')
  }
}

const notFoundPage = computed(() => {
  return Object.values(site.value?.pages ?? {}).find(
    (page) => page.route === '/not-found',
  )
})

const activePage = computed(() => {
  if (!site.value) {
    return undefined
  }
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

const pollOutdated = () => {
  if (!document.hidden) {
    checkOutdated()
  }
}

onMounted(() => {
  checkInterval = setInterval(checkOutdated, 3000)
  document.addEventListener('visibilitychange', pollOutdated)
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
  document.removeEventListener('visibilitychange', pollOutdated)
})
</script>

<style lang="postcss">
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
  .pm-p {
    word-wrap: break-word;
    white-space: pre-wrap;
  }
  .pm-p::after {
    content: '\200b';
  }
}
</style>
