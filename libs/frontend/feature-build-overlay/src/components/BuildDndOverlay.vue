<template>
  <div
    class="build-dnd-overlay build-dnd-overlay-selection"
    :style="selectionOverlayStyle"
  />
  <div class="build-dnd-overlay build-dnd-overlay-hover" :style="dndHoverOverlayStyle" />
  <HoverEdges />
  <ImageEdit
    v-if="imageEditStyle"
    :componentId="editor?.selectedComponent?.id"
    :style="imageEditStyle"
  />
</template>

<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import { Css, Tag } from '@pubstudio/shared/type-site'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { findStyles } from '@pubstudio/frontend/util-component'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { computeHoverOverlayStyle } from '../lib/hover-overlay-style'
import ImageEdit from './ImageEdit.vue'
import HoverEdges from './HoverEdges.vue'
import {
  selectionDimensions,
  selectionOverlayStyle,
  setBuildOverlays,
} from '../lib/feature-build-overlay'
import { debounce } from '@pubstudio/shared/util-debounce'

const { site, editor, activePage } = useSiteSource()

const dndHoverOverlayStyle = computed(() => {
  return computeHoverOverlayStyle(editor.value)
})

const imageEditStyle = computed(() => {
  const cmp = editor.value?.selectedComponent
  const dim = selectionDimensions.value
  if (cmp && dim) {
    const hasBg =
      findStyles(
        [Css.BackgroundImage],
        site.value,
        cmp,
        descSortedBreakpoints.value,
        activeBreakpoint.value,
      )['background-image'] !== undefined
    const isImg = cmp.tag === Tag.Img
    if (hasBg || isImg) {
      return {
        top: `${dim.top - 26}px`,
        left: `${dim.left + dim.width}px`,
      }
    }
  }
  return undefined
})

const debounceSetOverlays = debounce(
  () => {
    setBuildOverlays(editor.value, activePage.value)
  },
  30,
  30,
)

watch(
  [
    () => editor.value?.selectedComponent,
    () => editor.value?.builderScale,
    () => editor.value?.builderWidth,
  ],
  debounceSetOverlays,
)

watch(() => editor.value?.selectedComponent?.style, debounceSetOverlays, {
  deep: true,
})

onMounted(async () => {
  await setBuildOverlays(editor.value, activePage.value)
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.build-dnd-overlay {
  position: absolute;
  pointer-events: none;
  /* Ensure overlay is above absolute positioned components and below other builder UI. */
  z-index: $z-index-selection;
}
.image-edit {
  z-index: $z-index-builder-ui;
  position: absolute;
}
</style>
