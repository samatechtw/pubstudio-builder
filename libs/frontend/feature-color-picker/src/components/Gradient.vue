<template>
  <div class="gradient">
    <div class="gradient-preview" :class="{ [gradientType]: gradientType }" />
    <GradientBar
      :selectedIndex="selectedIndex"
      :gradientColors="gradientColors"
      :computedGradientForBar="computedGradientForBar"
      @select="emit('select', $event)"
      @update:stop="emit('update:stop', $event)"
      @blur:stop="emit('blur:stop')"
      @release:handle="emit('release:barHandle')"
    />
    <div class="gradient-colors">
      <div class="gradient-color-labels">
        <div class="color-label">#</div>
        <div class="stop-label">
          {{ t('style.toolbar.stop') }}
        </div>
        <div class="delete-label" />
      </div>
      <GradientColor
        v-for="(gradientColor, index) in gradientColors"
        :key="index"
        :gradientColor="gradientColor"
        :selected="selectedIndex === index"
        @select="emit('select', index)"
        @update:stop="updateStop(index, $event)"
        @blur:stop="emit('blur:stop')"
        @delete="emit('delete', index)"
      />
    </div>
    <div class="gradient-types">
      <div
        v-for="typeValue in GradientTypeValues"
        :key="typeValue"
        class="gradient-type"
        :class="{ active: gradientType === typeValue }"
        @click="emit('update:type', typeValue)"
      >
        {{ t(`style.toolbar.gradients.${typeValue}`) }}
      </div>
    </div>
    <GradientDegree
      v-if="isLinearGradient"
      :degree="gradientDegree"
      @update="emit('update:degree', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  GradientType,
  GradientTypeValues,
  IGradientColor,
} from '@pubstudio/frontend/util-gradient'
import GradientColor from './GradientColor.vue'
import GradientBar from './GradientBar.vue'
import GradientDegree from './GradientDegree.vue'
import { IUpdateGradientStopParams } from '../lib/use-gradient'

const { t } = useI18n()

const props = defineProps<{
  selectedIndex: number
  gradientType: GradientType
  gradientDegree: number
  gradientColors: IGradientColor[]
  computedGradient: string
  computedGradientForBar: string
}>()

const { selectedIndex, gradientType, gradientColors } = toRefs(props)

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'select', index: number): void
  (e: 'update:type', gradientType: GradientType): void
  (e: 'update:degree', degree: number): void
  (e: 'update:stop', params: IUpdateGradientStopParams): void
  (e: 'blur:stop'): void
  (e: 'release:barHandle'): void
  (e: 'delete', index: number): void
}>()

const isLinearGradient = computed(() => gradientType.value === GradientType.Linear)

const updateStop = (index: number, stop: number) => {
  emit('update:stop', {
    index,
    stop,
  })
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.gradient-preview {
  width: 50%;
  padding-bottom: 50%;
  margin: 8px auto 0 auto;
  background: v-bind(computedGradient);
}

.gradient-color-labels {
  @mixin flex-row;
  align-items: center;
  .color-label {
    @mixin text-medium 14px;
    @mixin flex-center;
    width: 42px;
    flex-shrink: 0;
  }
  .stop-label {
    @mixin text-medium 14px;
    flex-grow: 1;
    text-align: center;
  }
  .delete-label {
    width: 18px;
    margin-left: 8px;
  }
}

.gradient-types {
  @mixin flex-row;
  .gradient-type {
    @mixin text 14px;
    padding: 4px 8px;
    margin-top: 8px;
    color: $border1;
    border: 1px solid $grey-700;
    cursor: pointer;
    text-align: center;
    flex-grow: 1;
    user-select: none;
    &.active {
      color: white;
      background-color: $grey-700;
      border-right: none;
    }
    &:first-of-type {
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
    }
    &:last-of-type {
      border-top-right-radius: 8px;
      border-bottom-right-radius: 8px;
      border-left: none;
    }
  }
}
</style>
