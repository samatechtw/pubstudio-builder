<template>
  <div
    v-if="dndHoverOverlay"
    ref="edgesRef"
    :draggable="false"
    :style="dndHoverOverlay.style"
    class="hover-edges"
    :class="{
      'small-width': dndHoverOverlay.smallWidth,
      'small-height': dndHoverOverlay.smallHeight,
    }"
  >
    <div
      class="hover-edge right lr"
      :draggable="true"
      @mousedown="mousedown($event, 'right')"
      @dragStart="dragStart"
    ></div>
    <div
      class="hover-edge bottom tb"
      :draggable="true"
      @mousedown="mousedown($event, 'bottom')"
      @dragStart="dragStart"
    ></div>
    <div
      class="hover-edge bottom-right"
      :draggable="true"
      @mousedown="mousedown($event, 'bottom-right')"
      @dragStart="dragStart"
    ></div>
    <!--
    <div
      class="hover-edge left"
      :draggable="true"
      @dragStart="dragStart"
    ></div>
    <div
      class="hover-edge top"
      :draggable="true"
      @dragStart="dragStart"
    ></div>
  --></div>
</template>

<script lang="ts"></script>

<script lang="ts" setup>
import { ref } from 'vue'
import { Css, CssUnit } from '@pubstudio/shared/type-site'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { findStyles } from '@pubstudio/frontend/util-component'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import {
  getHeightPxPerPercent,
  getWidthPxPerPercent,
  isLengthValue,
} from '@pubstudio/frontend/feature-build-event'
import { dndHoverOverlay } from '../lib/feature-build-overlay'

const { site, editor, activePage } = useSiteSource()

const edgesRef = ref()

const dragStart = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const mousedown = (e: MouseEvent, side: string) => {
  const component = editor.value?.selectedComponent
  if (!component || component.id === activePage.value?.root.id) {
    return
  }
  const resizeCmp = document.getElementById(component.id)
  if (editor.value && resizeCmp) {
    const cmpCss = findStyles(
      [Css.Height, Css.Width, Css.Position],
      site.value,
      component,
      descSortedBreakpoints.value,
      activeBreakpoint.value,
    )

    const resizeCmpRect = resizeCmp.getBoundingClientRect()
    const parentRect = (resizeCmp.parentElement as HTMLElement).getBoundingClientRect()

    let startHeight = cmpCss.height || `${resizeCmpRect.height}px`
    if (!isLengthValue(startHeight)) {
      // Use the current height (px) of the resized component as the initial height
      startHeight = `${resizeCmpRect.height}px`
    }

    let startWidth = cmpCss.width
    if (!startWidth) {
      const resizeCmpIsAbsolute = cmpCss.position === 'absolute'

      if (resizeCmpIsAbsolute) {
        startWidth = `${resizeCmpRect.width}px`
      } else {
        startWidth = '100%'
      }
    } else if (!isLengthValue(startWidth)) {
      // Use the current width (px) of the resized component as the initial width
      startWidth = `${resizeCmpRect.width}px`
    }

    const heightUnit = startHeight.replace(/[-\d.]/g, '') as CssUnit
    const widthUnit = startWidth.replace(/[-\d.]/g, '') as CssUnit

    const resizeHeight = ['bottom', 'bottom-right'].includes(side)
    const resizeWidth = ['right', 'bottom-right'].includes(side)

    const heightPxPerPercent = getHeightPxPerPercent(parentRect, heightUnit)
    const widthPxPerPercent = getWidthPxPerPercent(parentRect, widthUnit)

    if (resizeHeight || resizeWidth) {
      editor.value.resizeData = {
        component,
        hasWidthProp: !!cmpCss.width,
        hasHeightProp: !!cmpCss.height,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: parseInt(startWidth ?? '0'),
        startHeight: parseInt(startHeight ?? '0'),
        widthUnit,
        heightUnit,
        firstMove: true,
        side,
        widthPxPerPercent,
        heightPxPerPercent,
      }
      e.preventDefault()
    }
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

$border-offset: 0px;
$edge-size: 14px;
$small-edge-size: 7px;

.top {
  top: $border-offset;
}
.bottom {
  bottom: $border-offset;
}
.lr {
  width: $edge-size;
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
.tb {
  left: 0;
  height: $edge-size;
  width: 100%;
  cursor: ns-resize;
}
.bottom-right {
  width: $edge-size;
  height: $edge-size;
  bottom: $border-offset;
  right: $border-offset;
  cursor: nwse-resize;
}
.hover-edges {
  position: absolute;
  /* Above absolute positioned components and below other builder UI. */
  z-index: $z-index-selection;
  pointer-events: none;
  &.small-width .lr {
    width: $small-edge-size;
  }
  &.small-height .tb {
    height: $small-edge-size;
  }
}
.hover-edge {
  position: absolute;
  /* background-color: rgba(0, 255, 255, 0.4); */
  pointer-events: auto;
}
</style>
