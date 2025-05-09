<template>
  <div class="build-content">
    <div :id="buildContentWindowId" ref="contentWindowRef">
      <div
        :id="buildContentWindowInnerId"
        class="build-content-window-inner scrollbar-small"
        :style="innerStyle"
      >
        <CustomStyle />
        <Mixins />
        <ComponentStyle />
        <FontLinks />
        <PageContent />
        <BuildDndOverlay />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, StyleValue } from 'vue'
import { debounce } from '@pubstudio/shared/util-debounce'
import { Css, IRawStyle } from '@pubstudio/shared/type-site'
import { findStyles } from '@pubstudio/frontend/util-component'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import {
  buildContentWindowId,
  buildContentWindowInnerId,
} from '@pubstudio/frontend/feature-build'
import { setBuilderWidth } from '@pubstudio/frontend/data-access-command'
import { useRenderBuilder } from '@pubstudio/frontend/feature-render-builder'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { builderContext } from '@pubstudio/frontend/util-builder'
import { BuildDndOverlay } from '@pubstudio/frontend/feature-build-overlay'

const { site, siteStore, activePage, setRestoredSite } = useSiteSource()
const { editor } = useSiteSource()

const {
  CustomStyle,
  Mixins,
  ComponentStyle,
  FontLinks,
  PageContent,
  rootComponentMinHeight,
} = useRenderBuilder({
  site,
  activePage,
})

const contentWindowRef = ref<HTMLDivElement>()

const innerStyle = computed<StyleValue>(() => {
  const { builderWidth = 0, builderScale = 1 } = editor.value ?? {}
  const { width: buildContentWindowWidth, height: buildContentWindowHeight } =
    builderContext.buildContentWindowSize.value

  let innerWidth = 0
  if (builderWidth <= buildContentWindowWidth) {
    innerWidth = builderWidth
  } else {
    innerWidth = buildContentWindowWidth / builderScale
  }

  const innerHeight = buildContentWindowHeight / builderScale

  // Set builder background/color to page root to handle the case
  //   when child components overflow the root
  let rootStyles: IRawStyle | undefined = undefined
  if (activePage.value) {
    rootStyles = findStyles(
      [Css.Background, Css.BackgroundColor],
      site.value,
      activePage.value?.root,
      descSortedBreakpoints.value,
      activeBreakpoint.value,
    )
  }
  return {
    width: `${innerWidth}px`,
    height: `${innerHeight}px`,
    transform: `scale(${builderScale})`,
    background: rootStyles?.[Css.Background],
    'background-color': rootStyles?.[Css.BackgroundColor],
  }
})

const resizeObserver = new ResizeObserver(
  debounce(([entry]) => {
    builderContext.buildContentWindowSize.value = {
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    }
    if (editor.value) {
      // Update builder scale by setting builder width
      setBuilderWidth(editor.value, editor.value.builderWidth)
    }
  }, 150),
)

// Refresh site from API when page is made visible, to avoid write conflicts
const checkOutdated = async () => {
  if (!document.hidden) {
    const restored = await siteStore.restore(site.value.content_updated_at)
    setRestoredSite(restored)
    if (restored) {
      console.log('Reload from API', site.value.content_updated_at)
    }
  }
}

onMounted(() => {
  if (contentWindowRef.value) {
    resizeObserver.observe(contentWindowRef.value)
  }
  document.addEventListener('visibilitychange', checkOutdated)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', checkOutdated)
  resizeObserver.disconnect()
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.build-content {
  @mixin flex-col;
  width: 100%;
  height: $view-height;
  background-color: white;
  padding: 12px 16px 12px;
  transition: width 0.2s ease;
  flex-grow: 1;
  overflow: hidden;
}
#build-content-window {
  /* -2px because of the border so that scrollbar doesn't show up */
  width: calc(100% - 2px);
  min-height: 100%;
  max-height: 100%;
  margin: auto;
  position: relative;
  .build-content-window-inner {
    position: relative;
    margin: auto;
    transform-origin: 0 0;
    overflow: auto;
    border: 1px solid $grey-300;
    /* Page root */
    & > div:not(.build-dnd-overlay) {
      min-height: v-bind(rootComponentMinHeight);
      /* Select anything that is the direct children of page root */
      & > :deep(*) {
        flex-shrink: 0;
      }
      & > :deep(img) {
        z-index: 1;
      }
    }
    :deep(.hover-in-tree) {
      position: relative;
      opacity: 0.5;
      .hover-overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: rgba(255, 255, 255, 0.1);
      }
      &--absolute {
        position: absolute;
      }
      &--fixed {
        position: fixed;
      }
      &--sticky {
        position: sticky;
      }
    }
    :deep(.force-relative) {
      position: relative;
    }
  }
}
</style>
