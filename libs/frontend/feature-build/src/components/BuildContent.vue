<template>
  <div class="build-content">
    <div :id="buildContentWindowId" ref="contentWindowRef">
      <div
        id="build-content-window-inner"
        class="build-content-window-inner"
        :style="innerStyle"
      >
        <ReusableStyle />
        <ComponentStyle />
        <GoogleFontLink />
        <PageContent />
        <BuildDndOverlay />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, StyleValue } from 'vue'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { debounce } from '@pubstudio/shared/util-debounce'
import { buildContentWindowId, useBuild } from '../lib/use-build'
import { setBuilderWidth } from '@pubstudio/frontend/feature-editor'
import { NotFound } from '@pubstudio/frontend/ui-widgets'
import { useRenderBuilder } from '../lib/use-render-builder'
import { Css, IRawStyle } from '@pubstudio/shared/type-site'
import { findStyles } from '@pubstudio/frontend/util-component'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import BuildDndOverlay from './BuildDndOverlay.vue'

const { site, activePage, editor } = useBuild()

const {
  ReusableStyle,
  ComponentStyle,
  GoogleFontLink,
  PageContent,
  rootComponentMinHeight,
} = useRenderBuilder({
  site,
  activePage,
  renderMode: RenderMode.Build,
  notFoundComponent: NotFound,
  unhead: false,
})

const contentWindowRef = ref<HTMLDivElement>()

const innerStyle = computed<StyleValue>(() => {
  const { builderWidth = 0, builderScale = 1 } = editor.value ?? {}
  const { width: buildContentWindowWidth, height: buildContentWindowHeight } =
    runtimeContext.buildContentWindowSize.value

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
    runtimeContext.buildContentWindowSize.value = {
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    }
    if (editor.value) {
      // Update builder scale by setting builder width
      setBuilderWidth(editor.value, editor.value.builderWidth)
    }
  }, 200),
)

onMounted(() => {
  if (contentWindowRef.value) {
    resizeObserver.observe(contentWindowRef.value)
  }
})

onUnmounted(() => {
  resizeObserver.disconnect()
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

$border-offset: 0px;

.build-content {
  @mixin flex-col;
  width: 100%;
  height: $view-height;
  padding: 12px 16px 12px;
  transition: width 0.2s ease;
  flex-grow: 1;
  overflow: hidden;
  #build-content-window {
    /* -2px because of the border so that scrollbar doesn't show up */
    width: calc(100% - 2px);
    min-height: 100%;
    max-height: 100%;
    margin: auto;
    border: 1px solid $grey-300;
    .build-content-window-inner {
      position: relative;
      margin: auto;
      transform-origin: 0 0;
      overflow: auto;
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
      }
      :deep(.hover) {
        position: relative;
        /* Absolute position elements don't display correctly if we override their position,
          so they're marked with a `hover-absolute` class in `computeBuilderStyleProps` */
        &.hover-absolute {
          position: absolute;
        }
        /* An absolute-positioned img is wrapped with div.hover-wrap on hover. We need to match the original
        image insets to avoid display issues. */
        &.hover-wrap-absolute {
          position: absolute;
          img {
            inset: 0;
          }
        }
        .hover-edge {
          position: absolute;
        }
        .top,
        .bottom {
          left: 0;
          height: 5px;
          width: 100%;
          cursor: ns-resize;
        }
        .top {
          top: $border-offset;
        }
        .bottom {
          bottom: $border-offset;
        }
        .left,
        .right {
          width: 5px;
          height: 100%;
          top: 0;
          cursor: ew-resize;
        }
        .left {
          left: $border-offset;
        }
        .right {
          right: $border-offset;
        }
        .bottom-right {
          width: 5px;
          height: 5px;
          bottom: $border-offset;
          right: $border-offset;
          cursor: nwse-resize;
        }
      }
    }
  }
}
</style>
