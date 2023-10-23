<template>
  <div class="color-type">
    <span class="name">
      {{ name }}
    </span>
    <input v-model="modelColor" class="value" />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    color: string
  }>(),
  { name: '', color: '' },
)
const { color } = toRefs(props)
const emit = defineEmits<{
  (e: 'inputColor', val: string): void
}>()

const modelColor = computed({
  get() {
    return color.value || ''
  },
  set(val) {
    emit('inputColor', val)
  },
})
</script>

<style lang="postcss" scoped>
.color-type {
  display: flex;
  margin-top: 4px;
  font-size: 12px;
  .name {
    width: 60px;
    height: 26px;
    float: left;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #999;
    background: #252930;
  }
  .value {
    flex: 1;
    height: 26px;
    min-width: 100px;
    padding: 0 12px;
    border: 0;
    color: #fff;
    background: #2e333a;
    box-sizing: border-box;
  }
}
</style>
