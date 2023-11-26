<template>
  <div ref="itemRef" class="link-wrap" @click="showLink">
    <div v-if="show" ref="tooltipRef" class="link" :style="tooltipStyle">
      <a :href="link" target="_blank">{{ link }}</a>
      <Copy class="copy" @click="copy(link)" />
      <div ref="arrowRef" :style="arrowStyle" class="arrow" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRefs } from 'vue'
import { copy } from '@pubstudio/frontend/util-doc'
import { useTooltip } from '@pubstudio/frontend/util-tooltip'
import { Copy } from '@pubstudio/frontend/ui-widgets'
import { useClickaway } from '@pubstudio/frontend/util-clickaway'

const props = defineProps<{
  link: string
}>()
const { link } = toRefs(props)

const { itemRef, arrowStyle, tooltipRef, tooltipStyle } = useTooltip({
  placement: 'top',
  arrow: true,
  shift: true,
  offset: 8,
})
const show = ref(false)

const { activate, deactivate } = useClickaway(
  '.arrow',
  () => {
    show.value = false
    deactivate()
  },
  true,
)

const showLink = () => {
  show.value = true
  activate()
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.link-wrap {
  @mixin overlay;
  z-index: 1000;
  pointer-events: none;
  position: absolute;
  top: 0;
  right: 0;
}
.edit {
  @mixin size 28px;
  cursor: pointer;
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
  position: absolute;
  top: -20px;
  right: -20px;
}
.link {
  @mixin tooltip;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  position: absolute;
  min-width: 220px;
  z-index: 1000;
  a {
    @mixin truncate;
    max-width: calc(100% - 30px);
  }
}
.copy {
  @mixin size 18px;
  margin-left: 6px;
  flex-shrink: 0;
  cursor: pointer;
  &:hover :deep(path) {
    fill: $color-toolbar-button-active;
    stroke: $color-toolbar-button-active;
  }
}

.arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid white;
  bottom: 10px;
  left: calc(50% - 6px);
}
</style>
