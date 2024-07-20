<template>
  <div
    class="build-dnd-overlay build-dnd-overlay-selection"
    :style="selectionOverlayStyle"
  />
  <div class="build-dnd-overlay build-dnd-overlay-hover" :style="hoverOverlayStyle" />
  <ImageEdit
    v-if="imageEditStyle"
    :componentId="editor?.selectedComponent?.id"
    :style="imageEditStyle"
  />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { Css, IComponent, Tag } from '@pubstudio/shared/type-site'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { findStyles } from '@pubstudio/frontend/util-component'
import { computeHoverOverlayStyle } from './hover-overlay-style'
import { ISelectionOverlay, computeSelectionOverlay } from './selection-overlay-style'
import ImageEdit from './ImageEdit.vue'

const { site, editor } = useBuild()

const selectionDimensions = ref<ISelectionOverlay>()

// Use `ref`+`watch` instead of `computed` because we have to wait for the screen to (re)render
// before calculating the width and height of the component on page load & after selection.
const selectionOverlayStyle = ref()

const hoverOverlayStyle = computed(() => {
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

const setSelectionOverlayStyle = async (component: IComponent | undefined) => {
  const dim = await computeSelectionOverlay(editor.value, component)
  selectionDimensions.value = dim
  if (dim) {
    selectionOverlayStyle.value = {
      top: `${dim.top - 1}px`,
      left: `${dim.left - 1}px`,
      width: `${dim.width}px`,
      height: `${dim.height}px`,
      border: '2px solid #3768FF',
    }
  } else {
    selectionOverlayStyle.value = undefined
  }
}

watch(
  site,
  async (newSite) => {
    await setSelectionOverlayStyle(newSite.editor?.selectedComponent)
  },
  {
    deep: true,
  },
)

onMounted(async () => {
  await setSelectionOverlayStyle(editor.value?.selectedComponent)
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
