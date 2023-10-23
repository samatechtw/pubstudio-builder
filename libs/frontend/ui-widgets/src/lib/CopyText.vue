<template>
  <div ref="itemRef" class="copy-wrap" @mouseenter="showTip" @mouseleave="show = false">
    <Copy class="copy" @click="copyText" />
    <div v-if="show" ref="tooltipRef" class="tip" :style="tooltipStyle">
      <div>
        {{ tip }}
      </div>
      <div ref="arrowRef" :style="arrowStyle" class="arrow" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRefs } from 'vue'
import { copy } from '@pubstudio/frontend/util-doc'
import { useTooltip } from '@pubstudio/frontend/util-tooltip'
import { Copy } from '@pubstudio/frontend/ui-widgets'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  text: string
}>()
const { text } = toRefs(props)

const { t } = useI18n()

const { itemRef, arrowStyle, tooltipRef, tooltipStyle } = useTooltip({
  placement: 'top',
  arrow: true,
  shift: true,
  offset: 8,
})
const show = ref(false)

const tip = ref(t('copy_text'))

const showTip = () => {
  tip.value = t('copy_text')
  show.value = true
}

const copyText = () => {
  copy(text.value)
  tip.value = t('copied')
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.tip {
  @mixin tooltip;
  @mixin flex-center;
  min-width: 72px;
  padding: 6px 8px;
  position: absolute;
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
