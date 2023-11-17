<template>
  <div class="build-dnd-overlay" :style="overlayStyle" />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'
import { useBuild } from '../lib/use-build'

const hoverOutlineThickness = 3
const outlineColor = '#F82389'

const { editor } = useBuild()

const overlayStyle = computed(() => {
  const buildDndState = runtimeContext.buildDndState.value
  if (buildDndState) {
    const buildContentWindowInner = document.getElementById('build-content-window-inner')
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

      const { top: buildContentWindowTop, left: buildContentWindowLeft } =
        buildContentWindowInner.getBoundingClientRect()

      const {
        top: elementTop,
        right: elementRight,
        bottom: elementBottom,
        left: elementLeft,
        width: elementWidth,
        height: elementHeight,
      } = hoverElement.getBoundingClientRect()

      const builderScale = editor.value?.builderScale ?? 1
      const outlineThickness = Math.min(
        hoverOutlineThickness,
        hoverOutlineThickness * builderScale,
      )

      const elementRelativeTop = elementTop - buildContentWindowTop
      const elementRelativeRight = elementRight - buildContentWindowLeft
      const elementRelativeBottom = elementBottom - buildContentWindowTop
      const elementRelativeLeft = elementLeft - buildContentWindowLeft

      let [overlayTop, overlayLeft, overlayWidth, overlayHeight] = [0, 0, 0, 0]
      let [overlayBackgroundColor, overlayBorder] = ['', '']

      if (hoverSelf) {
        overlayTop = elementRelativeTop
        overlayLeft = elementRelativeLeft
        overlayWidth = elementWidth
        overlayHeight = elementHeight
        overlayBorder = `1.5px solid ${outlineColor}`
      } else if (hoverCmpParentIsRow) {
        if (hoverLeft) {
          overlayTop = elementRelativeTop
          overlayLeft = elementRelativeLeft
          overlayWidth = outlineThickness
          overlayHeight = elementHeight
          overlayBackgroundColor = outlineColor
        } else if (hoverRight) {
          overlayTop = elementRelativeTop
          overlayLeft = elementRelativeRight - outlineThickness
          overlayWidth = outlineThickness
          overlayHeight = elementHeight
          overlayBackgroundColor = outlineColor
        }
      } else {
        if (hoverTop) {
          overlayTop = elementRelativeTop
          overlayLeft = elementRelativeLeft
          overlayWidth = elementWidth
          overlayHeight = outlineThickness
          overlayBackgroundColor = outlineColor
        } else if (hoverBottom) {
          overlayTop = elementRelativeBottom - outlineThickness
          overlayLeft = elementRelativeLeft
          overlayWidth = elementWidth
          overlayHeight = outlineThickness
          overlayBackgroundColor = outlineColor
        }
      }

      // Divide offsets by `builderScale` because `.build-content-window-inner` would scale
      // based on the `builderScale` in the editor context.
      overlayTop /= builderScale
      overlayLeft /= builderScale
      overlayWidth /= builderScale
      overlayHeight /= builderScale

      overlayTop += buildContentWindowInner.scrollTop
      overlayLeft += buildContentWindowInner.scrollLeft

      return {
        top: `${overlayTop}px`,
        left: `${overlayLeft}px`,
        width: `${overlayWidth}px`,
        height: `${overlayHeight}px`,
        backgroundColor: overlayBackgroundColor,
        border: overlayBorder,
      }
    }
  }
  return undefined
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.build-dnd-overlay {
  position: absolute;
  pointer-events: none;
}
</style>
