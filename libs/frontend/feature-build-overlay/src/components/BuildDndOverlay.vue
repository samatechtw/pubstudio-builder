<template>
  <div
    class="build-dnd-overlay build-dnd-overlay-selection"
    :style="selectionOverlayStyle"
  />
  <div class="build-dnd-overlay build-dnd-overlay-hover" :style="dndHoverOverlayStyle" />
  <div class="build-dnd-overlay build-component-hover" :style="hoverOverlayStyle" />
  <HoverEdges />
  <ImageEdit v-if="imageEditStyle" :componentId="selectedId" :style="imageEditStyle" />
  <SvgEdit
    v-if="svgEditStyle && selectedId"
    :componentId="selectedId"
    :style="svgEditStyle"
    class="svg-edit"
  />
  <ListAdd
    v-if="listAddStyle && selectedId"
    :componentId="selectedId"
    :style="listAddStyle"
  />
  <LinkTooltip
    v-if="linkTooltipStyle && selectedId"
    :key="selectedId"
    :componentId="selectedId"
    :mode="LinkTooltipMode.Component"
    :link="linkTooltipStyle.link"
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
import { debounce } from '@pubstudio/shared/util-debounce'
import { builderContext } from '@pubstudio/frontend/util-builder'
import { getPref } from '@pubstudio/frontend/data-access-command'
import {
  LinkTooltip,
  LinkTooltipMode,
  ListAdd,
  SvgEdit,
} from '@pubstudio/frontend/feature-render-builder'
import { computeHoverOverlayStyle } from '../lib/hover-overlay-style'
import ImageEdit from './ImageEdit.vue'
import HoverEdges from './HoverEdges.vue'
import {
  selectionDimensions,
  selectionOverlayStyle,
  setBuildOverlays,
} from '../lib/feature-build-overlay'
import { computeSelectionOverlay } from '../lib/compute-selection-overlay'
import { computeInputs } from '@pubstudio/frontend/util-render'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'

const { site, editor, activePage } = useSiteSource()

const dndHoverOverlayStyle = computed(() => {
  return computeHoverOverlayStyle(editor.value)
})

const selectedId = computed(() => {
  return editor.value?.selectedComponent?.id
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
      const top = dim.top - 30
      return {
        top: `${top < 0 ? 4 : top}px`,
        left: `${dim.left + dim.width - 40}px`,
      }
    }
  }
  return undefined
})

const svgEditStyle = computed(() => {
  const cmp = editor.value?.selectedComponent
  const dim = selectionDimensions.value
  if (cmp && dim) {
    if (cmp.tag === Tag.Svg) {
      const top = dim.top - 30
      return {
        top: `${top < 0 ? 2 : top}px`,
        left: `${dim.left + dim.width - 40}px`,
      }
    }
  }
  return undefined
})

const listAddStyle = computed(() => {
  const cmp = editor.value?.selectedComponent
  const dim = selectionDimensions.value
  if (cmp && dim) {
    if (cmp.tag === Tag.Ul || cmp.tag === Tag.Ol) {
      const top = dim.top + dim.height - 18
      return {
        top: `${top}px`,
        left: `${dim.left + 40}px`,
      }
    }
  }
  return undefined
})

const linkTooltipStyle = computed(() => {
  const cmp = editor.value?.selectedComponent
  const dim = selectionDimensions.value
  if (cmp && dim && cmp.tag === Tag.A) {
    const display =
      findStyles(
        [Css.Display],
        site.value,
        cmp,
        descSortedBreakpoints.value,
        activeBreakpoint.value,
      ).display ?? null
    if (display !== 'none') {
      const top = dim.top - 30
      const r = resolveComponent(site.value.context, cmp.customSourceId)
      const attrs = computeInputs(site.value.context, cmp, r, {
        resolveTheme: false,
        onlyAttrs: true,
      })
      const link = attrs.href?.toString() ?? ''
      return {
        link,
        // Not currently used, since the link tooltip calculates its own position
        style: {
          top: `${top < 0 ? 2 : top}px`,
          left: `${dim.left + dim.width - 40}px`,
        },
      }
    }
  }
  return undefined
})

const getComponentHoverStyle = (componentId: string | undefined) => {
  if (componentId === activePage.value?.root.id) {
    return undefined
  }
  const dim = computeSelectionOverlay(editor.value, componentId)
  if (dim) {
    const hoverColor = getPref(editor.value, 'componentHoverColor')
    return {
      top: `${dim.top - 1}px`,
      left: `${dim.left - 1}px`,
      width: `${dim.width}px`,
      height: `${dim.height}px`,
      'background-color': hoverColor,
    }
  }
  return undefined
}

const hoverOverlayStyle = computed(() => {
  const show = getPref(editor.value, 'componentMenuHover')
  if (!show) {
    return
  }
  const hoverId =
    builderContext.hoveredComponentIdInComponentTree.value ||
    editor.value?.hoveredComponent?.id
  return getComponentHoverStyle(hoverId)
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

.dragging-mode .build-dnd-overlay-selection {
  display: none;
}

.build-dnd-overlay {
  position: absolute;
  pointer-events: none;
  /* Ensure overlay is above absolute positioned components and below other builder UI. */
  z-index: $z-index-selection;
}
.svg-edit {
  z-index: $z-index-builder-ui;
  position: absolute;
}
</style>
