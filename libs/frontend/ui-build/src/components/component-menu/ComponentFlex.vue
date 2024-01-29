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
} from '@pubstudio/frontend/ui-widgets'
import { useToolbar } from '@pubstudio/frontend/feature-build'
import { Css } from '@pubstudio/shared/type-site'

const { t } = useI18n()
const { getStyleValue, setStyleEnsureFlex } = useToolbar()

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
  margin: 0 auto;
}
</style>
