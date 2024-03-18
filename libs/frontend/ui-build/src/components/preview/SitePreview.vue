<template>
  <div class="preview-content">
    <ReusableStyle />
    <ComponentStyle />
    <GoogleFontLink />
    <PageContent />
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { useRenderPreview } from '@pubstudio/frontend/feature-preview'
import { NotFound } from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { IPage } from '@pubstudio/shared/type-site'

const { site } = useBuild()

const props = withDefaults(
  defineProps<{
    renderMode?: RenderMode
    activePage: IPage | undefined
  }>(),
  {
    renderMode: RenderMode.Preview,
  },
)
const { renderMode, activePage } = toRefs(props)

const {
  ReusableStyle,
  ComponentStyle,
  GoogleFontLink,
  PageContent,
  rootComponentMinHeight,
} = useRenderPreview({
  site,
  activePage,
  renderMode: renderMode.value,
  notFoundComponent: NotFound,
  unhead: true,
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
