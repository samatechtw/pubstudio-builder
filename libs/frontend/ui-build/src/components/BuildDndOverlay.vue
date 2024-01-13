<template>
  <div class="build-dnd-overlay build-dnd-overlay-hover" :style="hoverOverlayStyle" />
  <div
    class="build-dnd-overlay build-dnd-overlay-selection"
    :style="selectionOverlayStyle"
  />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'
import { buildContentWindowInnerId, useBuild } from '@pubstudio/frontend/feature-build'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { IComponent } from '@pubstudio/shared/type-site'
import { sleep } from '@pubstudio/shared/util-core'

const hoverOutlineThickness = 6
const outlineColor = '#000'
const selfOutlineColor = '#F82389'

const { editor } = useBuild()

const hoverOverlayStyle = computed(() => {
  const buildDndState = runtimeContext.buildDndState.value
  if (buildDndState) {
    const buildContentWindowInner = document.getElementById(buildContentWindowInnerId)
    const hoverElement = document.getElementById(buildDndState.hoverCmpId)

    if (buildContentWindowInner && hoverElement) {
      const {
        hoverSelf,
        hoverTop,
        hoverRight,
        hoverBottom,
        hoverLeft,
        hoverCmpParentIsRow,
      } = buildDndState

      const {
        relativeTop,
        relativeRight,
        relativeBottom,
        relativeLeft,
        elementWidth,
        elementHeight,
      } = computeRelativeRect(buildContentWindowInner, hoverElement)

      const builderScale = editor.value?.builderScale ?? 1
      const outlineThickness = Math.min(
        hoverOutlineThickness,
        hoverOutlineThickness * builderScale,
      )

      let [overlayTop, overlayLeft, overlayWidth, overlayHeight] = [0, 0, 0, 0]
      let [overlayBackgroundColor, overlayBorder] = ['', '']

      overlayTop = relativeTop
      overlayLeft = relativeLeft
      if (hoverSelf) {
        overlayWidth = elementWidth
        overlayHeight = elementHeight
        overlayBorder = `1.5px solid ${selfOutlineColor}`
      } else if (hoverCmpParentIsRow) {
        if (hoverLeft) {
          overlayWidth = outlineThickness
          overlayHeight = elementHeight
          overlayBackgroundColor = outlineColor
        } else if (hoverRight) {
          overlayTop = relativeTop
          overlayLeft = relativeRight - outlineThickness
          overlayWidth = outlineThickness
          overlayHeight = elementHeight
          overlayBackgroundColor = outlineColor
        }
      } else {
        if (hoverTop) {
          overlayWidth = elementWidth
          overlayHeight = outlineThickness
          overlayBackgroundColor = outlineColor
        } else if (hoverBottom) {
          overlayTop = relativeBottom - outlineThickness
          overlayWidth = elementWidth
          overlayHeight = outlineThickness
          overlayBackgroundColor = outlineColor
        }
      }

      const { top, left, width, height } = normalizeDimensions(
        overlayTop,
        overlayLeft,
        overlayWidth,
        overlayHeight,
        buildContentWindowInner,
      )

      return {
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: overlayBackgroundColor,
        border: overlayBorder,
      }
    }
  }
  return undefined
})

// Use `ref`+`watch` instead of `computed` because we have to wait for the screen to (re)render
// before calculating the width and height of the component on page load & after selection.
const selectionOverlayStyle = ref()

const computeSelectionOverlay = async (selectedComponent: IComponent | undefined) => {
  if (selectedComponent) {
    // This sleep is necessary for buildContentWindowInner and componentElement
    await sleep(1)

    const buildContentWindowInner = document.getElementById(buildContentWindowInnerId)
    let componentElement = document.getElementById(selectedComponent.id)
    // Container size might be different from the actual component
    const containerChild = componentElement?.children?.[0]
    if (containerChild?.className?.includes('component-content-container')) {
      componentElement = containerChild.children?.[0] as HTMLElement
    }

    if (buildContentWindowInner && componentElement) {
      const { top: buildContentWindowTop, left: buildContentWindowLeft } =
        buildContentWindowInner.getBoundingClientRect()

      const {
        top: elementTop,
        left: elementLeft,
        width: elementWidth,
        height: elementHeight,
      } = componentElement.getBoundingClientRect()

      const elementRelativeTop = elementTop - buildContentWindowTop
      const elementRelativeLeft = elementLeft - buildContentWindowLeft

      const { top, left, width, height } = normalizeDimensions(
        elementRelativeTop,
        elementRelativeLeft,
        elementWidth,
        elementHeight,
        buildContentWindowInner,
      )

      selectionOverlayStyle.value = {
        top: `${top - 1}px`,
        left: `${left - 1}px`,
        width: `${width}px`,
        height: `${height}px`,
        border: '2px solid #3768FF',
      }
    }
  } else {
    selectionOverlayStyle.value = undefined
  }
}

watch(
  () => ({
    selectedComponent: editor.value?.selectedComponent,
    // Re-compute selection overlay width & height when active breakpoint changes.
    activeBreakpoint: activeBreakpoint.value,
    // Recompute on window resize
    buildContentWindowSize: runtimeContext.buildContentWindowSize.value,
  }),
  async ({ selectedComponent }) => {
    computeSelectionOverlay(selectedComponent)
  },
  {
    deep: true,
  },
)

const computeRelativeRect = (
  buildContentWindowInner: HTMLElement,
  element: HTMLElement,
) => {
  const { top: buildContentWindowTop, left: buildContentWindowLeft } =
    buildContentWindowInner.getBoundingClientRect()

  const {
    top: elementTop,
    right: elementRight,
    bottom: elementBottom,
    left: elementLeft,
    width: elementWidth,
    height: elementHeight,
  } = element.getBoundingClientRect()

  const relativeTop = elementTop - buildContentWindowTop
  const relativeRight = elementRight - buildContentWindowLeft
  const relativeBottom = elementBottom - buildContentWindowTop
  const relativeLeft = elementLeft - buildContentWindowLeft

  return {
    relativeTop,
    relativeRight,
    relativeBottom,
    relativeLeft,
    elementWidth,
    elementHeight,
  }
}

// Divide offsets by `builderScale` because `.build-content-window-inner` scales
// based on `builderScale` in the editor context.
const normalizeDimensions = (
  overlayTop: number,
  overlayLeft: number,
  overlayWidth: number,
  overlayHeight: number,
  buildContentWindowInner: HTMLElement,
) => {
  const builderScale = editor.value?.builderScale ?? 1

  let top = overlayTop / builderScale
  let left = overlayLeft / builderScale
  const width = overlayWidth / builderScale
  const height = overlayHeight / builderScale

  top += buildContentWindowInner.scrollTop
  left += buildContentWindowInner.scrollLeft

  return {
    left,
    top,
    width,
    height,
  }
}

onMounted(() => {
  computeSelectionOverlay(editor.value?.selectedComponent)
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.build-dnd-overlay {
  position: absolute;
  pointer-events: none;
  /* Ensure overlay is on top of absolute positioned components. */
  z-index: 1;
}
</style>
