<template>
  <div>
    <ul class="colors">
      <li
        v-for="item in colorsDefault"
        :key="item"
        class="item"
        @click="selectColor(item)"
      >
        <div :style="{ background: `url(${imgAlphaBase64})` }" class="alpha" />
        <div :style="{ background: item }" class="color" />
      </li>
    </ul>
    <ul v-if="colorsHistory.length" class="colors history">
      <li
        v-for="item in colorsHistory"
        :key="item"
        class="item"
        @click="selectColor(item)"
      >
        <div :style="{ background: `url(${imgAlphaBase64})` }" class="alpha" />
        <div :style="{ background: item }" class="color" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { createAlphaSquare } from '../lib/color-picker-util'

withDefaults(
  defineProps<{
    colorsDefault?: string[]
  }>(),
  {
    colorsDefault: () => [],
  },
)
const emit = defineEmits<{
  (e: 'selectColor', color: string): void
}>()

const color = ref()
const colorsHistory = ref<string[]>([])
const imgAlphaBase64 = createAlphaSquare(4).toDataURL()

function selectColor(color: string) {
  emit('selectColor', color)
}
</script>

<style lang="postcss" scoped>
.colors {
  padding: 0;
  margin: 0;
  margin-left: -8px;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  &.history {
    margin-top: 10px;
    border-top: 1px solid #2e333a;
  }
  .item {
    position: relative;
    width: 16px;
    height: 16px;
    margin: 8px 0 0 8px;
    border-radius: 3px;
    box-sizing: border-box;
    vertical-align: top;
    display: inline-block;
    transition: all 0.1s;
    cursor: pointer;
    &:hover {
      transform: scale(1.4);
    }
    .alpha {
      height: 100%;
      border-radius: 4px;
    }
    .color {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      border-radius: 3px;
    }
  }
}
</style>
