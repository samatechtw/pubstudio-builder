<template>
  <IconTooltip class="copy-wrap" :tip="tip" @mouseenter="mouseEnter">
    <Copy class="copy" @click="copyText" />
  </IconTooltip>
</template>

<script lang="ts" setup>
import { ref, toRefs } from 'vue'
import { copy } from '@pubstudio/frontend/util-doc'
import { Copy } from '@pubstudio/frontend/ui-widgets'
import { useI18n } from 'petite-vue-i18n'
import IconTooltip from './IconTooltip.vue'

const props = withDefaults(
  defineProps<{
    text: string
    tooltip?: string
  }>(),
  {
    tooltip: 'copy_text',
  },
)
const { text, tooltip } = toRefs(props)

const { t } = useI18n()

const tip = ref(t(tooltip.value))

const mouseEnter = () => {
  tip.value = t(tooltip.value)
}

const copyText = () => {
  copy(text.value)
  tip.value = t('copied')
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.copy-wrap {
  position: relative;
}

:deep(.tip) {
  min-width: 72px;
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
</style>
