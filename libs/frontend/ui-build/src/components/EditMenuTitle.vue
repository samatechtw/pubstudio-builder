<template>
  <div class="menu-subtitle menu-row">
    <Caret
      v-if="collapsed !== undefined"
      class="caret"
      :class="{ closed: !!collapsed }"
      @click="emit('toggleCollapse')"
    />
    <div
      class="label"
      :class="{ collapse: collapsed !== undefined }"
      @click="emit('toggleCollapse')"
    >
      {{ title }}
      <span v-if="subTitle" class="sub-label">
        {{ subTitle }}
      </span>
    </div>
    <slot />
    <div v-if="showAdd" class="item">
      <Plus class="item-add" @click="emit('add')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Caret, Plus } from '@pubstudio/frontend/ui-widgets'

withDefaults(
  defineProps<{
    title: string
    subTitle?: string
    showAdd?: boolean
    collapsed?: boolean
  }>(),
  {
    subTitle: undefined,
    showAdd: true,
    collapsed: undefined,
  },
)

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'toggleCollapse'): void
}>()
</script>

<style lang="postcss" scoped>
.caret {
  position: absolute;
  left: -16px;
  width: 16px;
  height: 100%;
  cursor: pointer;
  transition: transform 0.2s;
  transform: rotate(90deg);
  &.closed {
    transform: rotate(0deg);
  }
}
.collapse {
  cursor: pointer;
}
</style>
