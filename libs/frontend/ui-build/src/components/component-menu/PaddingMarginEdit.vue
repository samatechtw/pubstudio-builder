<template>
  <div class="pm-edit-wrap" :class="{ 'edit-value-wrap': !!editValueData }">
    <div class="pm-edit">
      <div
        v-for="(data, index) in divData"
        :key="index"
        :class="data.id"
        @mousedown="startDrag($event, data.css, data.side)"
      >
        <div
          :class="`value v-${data.id}`"
          @mousedown="editMousedown($event, data.css, data.side)"
          @mouseup="editValue"
        >
          <div :id="`v-${data.id}`">
            {{ (data.css === Css.Margin ? margin : padding)[data.side] }}
          </div>
        </div>
      </div>
      <div class="m-label">
        {{ t('margin') }}
      </div>
      <div class="p-label">
        {{ t('padding') }}
      </div>
    </div>
    <div v-if="editValueData" class="edit-value">
      <STInput
        :modelValue="editValueComputed"
        @update:modelValue="updateInputValue($event)"
        @keydown.enter="setValue(editValueData.inputValue)"
      />
      <PSButton size="small" :text="t('auto')" @click.stop="setValue('auto')" />
      <PSButton size="small" :text="t('unset')" @click.stop="setValue('unset')" />
      <img :src="IcX" class="edit-cancel" @click.stop="editValueData = undefined" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onUnmounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'
import { Css } from '@pubstudio/shared/type-site'
import { usePaddingMarginEdit, DragSide } from '@pubstudio/frontend/feature-build'
import { PSButton } from '@pubstudio/frontend/ui-widgets'
import { stringToCssValue } from '@pubstudio/shared/util-parse'
import IcX from '@frontend-assets/icon/x.svg'

const { t } = useI18n()

const {
  editMousedown,
  editValue,
  setValue,
  editValueData,
  editValueComputed,
  startDrag,
  stopDrag,
  padding,
  margin,
} = usePaddingMarginEdit()

interface IDivData {
  css: Css.Margin | Css.Padding
  side: DragSide
  id: string
}

const divData: IDivData[] = [
  { css: Css.Margin, side: DragSide.Left, id: 'm-left' },
  { css: Css.Margin, side: DragSide.Right, id: 'm-right' },
  { css: Css.Margin, side: DragSide.Top, id: 'm-top' },
  { css: Css.Margin, side: DragSide.Bottom, id: 'm-bottom' },
  { css: Css.Padding, side: DragSide.Left, id: 'p-left' },
  { css: Css.Padding, side: DragSide.Right, id: 'p-right' },
  { css: Css.Padding, side: DragSide.Top, id: 'p-top' },
  { css: Css.Padding, side: DragSide.Bottom, id: 'p-bottom' },
]

const updateInputValue = (v: string) => {
  if (editValueData.value) {
    editValueData.value.inputValue = stringToCssValue(v)
  }
}

onUnmounted(() => {
  stopDrag()
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

$height: 108px;
$width: 214px;
$mh: 24px;
$mw: 38px;
$m-color: $blue-300;
$hover-color: rgba($blue-300, 0.8);
$inner-h: calc($height - ($mh * 2) - 2px);
$inner-w: calc($width - ($mw * 2) - 2px);
$ph: calc($inner-h / 2);
$pw: 42px;
$p-color: $blue-100;
$edit-height: 36px;

.pm-edit-wrap {
  @mixin flex-center;
  align-items: flex-start;
  height: $height;
  transition: height 0.2s;
  width: calc($height * 2);
  position: relative;
  user-select: none;
  &.edit-value-wrap {
    height: calc($height + $edit-height);
  }
  .edit-value {
    @mixin flex-center;
    position: absolute;
    width: 100%;
    left: 0;
    bottom: 0;
    height: $edit-height;
    padding: 8px 0 0;
    :deep(.p-button) {
      @mixin title 12px;
      letter-spacing: 0.01;
      margin-left: 8px;
      height: 28px;
      min-width: 60px;
    }
    :deep(.st-input) {
      height: 28px;
      width: 54px;
    }
  }
  .edit-cancel {
    @mixin size 18px;
    cursor: pointer;
    margin-left: 8px;
  }
}

.pm-edit {
  position: relative;
  top: 0;
  height: $height;
  width: 100%;
  background-color: $grey-500;
}

.m-label {
  @mixin title 10px;
  position: absolute;
  left: 6px;
  top: 2px;
  color: $color-primary;
}

.p-label {
  @mixin title 10px;
  position: absolute;
  left: calc($mw + 4px);
  top: calc($mh + 1px);
  pointer-events: none;
  color: $color-primary;
}

.value {
  position: relative;
  cursor: pointer;
  font-size: 14px;
  color: $grey-900;
}

.m-left {
  @mixin flex-center;
  position: absolute;
  border-top: $mh solid transparent;
  border-left: $mw solid $m-color;
  border-bottom: $mh solid transparent;
  height: $height;
  width: 0;
  top: 0;
  left: 0;
  cursor: ew-resize;
  &:hover {
    border-left-color: $hover-color;
  }
}
.v-m-left {
  margin-left: -38px;
}
.m-right {
  @mixin flex-center;
  position: absolute;
  border-top: $mh solid transparent;
  border-right: $mw solid $m-color;
  border-bottom: $mh solid transparent;
  height: $height;
  width: 0;
  top: 0;
  right: 0;
  cursor: ew-resize;
  &:hover {
    border-right-color: $hover-color;
  }
}
.v-m-right {
  margin-left: 38px;
}
.m-bottom {
  @mixin flex-center;
  position: absolute;
  border-bottom: $mh solid $m-color;
  border-left: $mw solid transparent;
  border-right: $mw solid transparent;
  height: 0;
  bottom: 0;
  left: 1px;
  cursor: ns-resize;
  width: $width;
  &:hover {
    border-bottom-color: $hover-color;
  }
}
.v-m-bottom {
  margin-bottom: -22px;
}
.m-top {
  @mixin flex-center;
  position: absolute;
  border-top: $mh solid $m-color;
  border-left: $mw solid transparent;
  border-right: $mw solid transparent;
  height: 0;
  top: 0;
  left: 1px;
  cursor: ns-resize;
  width: $width;
  &:hover {
    border-top-color: $hover-color;
  }
}
.v-m-top {
  margin-top: -22px;
}

.p-left {
  @mixin flex-center;
  position: absolute;
  border-top: 24px solid transparent;
  border-left: $pw solid $p-color;
  border-bottom: 24px solid transparent;
  height: $inner-h;
  width: 0;
  top: calc($mh + 1px);
  left: calc($mw + 1px);
  cursor: ew-resize;
  &:hover {
    border-left-color: $hover-color;
  }
}
.v-p-left {
  margin-left: -50px;
}
.p-right {
  @mixin flex-center;
  position: absolute;
  border-top: 24px solid transparent;
  border-right: $pw solid $p-color;
  border-bottom: 24px solid transparent;
  height: $inner-h;
  width: 0;
  top: calc($mh + 1px);
  right: calc($mw + 1px);
  cursor: ew-resize;
  &:hover {
    border-right-color: $hover-color;
  }
}
.v-p-right {
  margin-left: 52px;
}
.p-top {
  @mixin flex-center;
  position: absolute;
  border-top: 24px solid $p-color;
  border-right: 42px solid transparent;
  border-left: 42px solid transparent;
  height: 0;
  width: $inner-w;
  top: calc($mh + 1px);
  left: calc($mw + 2px);
  cursor: ns-resize;
  &:hover {
    border-top-color: $hover-color;
  }
}
.v-p-top {
  margin-top: -24px;
}
.p-bottom {
  @mixin flex-center;
  position: absolute;
  border-bottom: 24px solid $p-color;
  border-right: 42px solid transparent;
  border-left: 42px solid transparent;
  height: 0;
  width: $inner-w;
  bottom: calc($mh + 1px);
  left: calc($mw + 2px);
  cursor: ns-resize;
  &:hover {
    border-bottom-color: $hover-color;
  }
}
.v-p-bottom {
  margin-bottom: -24px;
}
</style>
