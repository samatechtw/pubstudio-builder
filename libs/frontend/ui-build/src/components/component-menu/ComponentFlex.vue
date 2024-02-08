<template>
  <div class="component-flex">
    <div class="flex-title">
      {{ t('flex') }}
    </div>
    <div class="flex-items">
      <ToolbarItem
        :active="isWrap"
        :tooltip="t('style.toolbar.flex_wrap')"
        @click="toggleWrap"
      >
        <FlexWrap />
      </ToolbarItem>
      <ToolbarItem
        :active="isColumn"
        :tooltip="t('style.toolbar.flex_vertical')"
        @click="toggleDirection('column')"
      >
        <FlexColumn />
      </ToolbarItem>
      <ToolbarItem
        :active="isRow"
        :tooltip="t('style.toolbar.flex_horizontal')"
        @click="toggleDirection('row')"
      >
        <FlexRow />
      </ToolbarItem>
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
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  FlexRow,
  FlexColumn,
  FlexWrap,
  ToolbarItem,
  ToolbarFlex,
  ToolbarFlexBasis,
} from '@pubstudio/frontend/ui-widgets'
import { useToolbar } from '@pubstudio/frontend/feature-build'
import { Css } from '@pubstudio/shared/type-site'
import { parseFlex, IParsedFlex } from '@pubstudio/frontend/util-component'

const { t } = useI18n()
const { getStyleValue, setStyleEnsureFlex, setStyleOrReplace } = useToolbar()

const flex = computed<IParsedFlex>(() => {
  const val = getStyleValue(Css.Flex)
  return parseFlex(val)
})

const isColumn = computed(() => {
  return getStyleValue(Css.FlexDirection) === 'column'
})

const isWrap = computed(() => {
  return getStyleValue(Css.FlexWrap) === 'wrap'
})

const toggleWrap = () => {
  const value = isWrap.value ? undefined : 'wrap'
  setStyleEnsureFlex(Css.FlexWrap, value)
}

const isRow = computed(() => {
  return getStyleValue(Css.FlexDirection) === 'row'
})

const toggleDirection = (value: string) => {
  if (getStyleValue(Css.FlexDirection) !== value) {
    setStyleEnsureFlex(Css.FlexDirection, value)
  }
}

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
  padding: 6px 16px;
}
.flex-title {
  @mixin title-bold 13px;
}
.flex-items {
  display: flex;
  align-items: center;
  margin: 0 auto;
}
</style>
