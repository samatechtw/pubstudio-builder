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
import { toRefs } from 'vue'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { useRenderPreview } from '@pubstudio/frontend/feature-preview'
import { NotFound, Spinner } from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { IPage } from '@pubstudio/shared/type-site'

const { site } = useBuild()

const props = withDefaults(
  defineProps<{
    renderMode?: RenderMode
    // Active page allows user to control routing scheme
    activePage: IPage | undefined
    loading?: boolean
  }>(),
  {
    renderMode: RenderMode.Preview,
  },
)
const { renderMode, activePage } = toRefs(props)

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
  renderMode: renderMode.value,
  notFoundComponent: NotFound,
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
