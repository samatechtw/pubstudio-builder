<template>
  <div class="component-flex">
    <div class="flex-title">
      {{ t('flex') }}
    </div>
    <ToolbarFlex
      :modelValue="flex.grow"
      :label="t('style.toolbar.grow')"
      @update:modelValue="updateGrow"
    />
    <ToolbarFlex
      :modelValue="flex.shrink"
      :label="t('style.toolbar.shrink')"
      @update:modelValue="updateShrink"
    />
    <ToolbarFlexBasis :flex="flex" @updateBasis="updateBasis" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ToolbarFlex, ToolbarFlexBasis } from '@pubstudio/frontend/ui-widgets'
import { useToolbar } from '@pubstudio/frontend/feature-build'
import { Css } from '@pubstudio/shared/type-site'
import { parseFlex, IParsedFlex } from '@pubstudio/frontend/util-component'

const { t } = useI18n()
const { getStyleValue, setStyleOrReplace } = useToolbar()

const flex = computed<IParsedFlex>(() => {
  const val = getStyleValue(Css.Flex)
  return parseFlex(val)
})

const updateFlex = (newFlex: IParsedFlex) => {
  const flexStr = `${newFlex.grow} ${newFlex.shrink} ${newFlex.basis}`
  setStyleOrReplace(Css.Flex, flexStr)
}

const updateGrow = (grow: string) => {
  if (grow) {
    updateFlex({ ...flex.value, grow })
  }
}

const updateShrink = (shrink: string) => {
  if (shrink) {
    updateFlex({ ...flex.value, shrink })
  }
}

const updateBasis = (basis: string | undefined) => {
  if (basis) {
    updateFlex({ ...flex.value, basis })
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-flex {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  margin: 0 auto;
}
.flex-title {
  @mixin title-bold 13px;
  margin-right: 8px;
}
</style>
