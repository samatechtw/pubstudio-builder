<template>
  <div class="color-picker-wrap">
    <ToolbarItem :tooltip="tooltip" @click="emit('click', $event)">
      <slot />
    </ToolbarItem>
    <ColorPicker
      v-if="showPicker"
      :color="color"
      :gradient="gradient"
      :selectedThemeColors="selectedThemeColors"
      class="font-color"
      @selectColor="emit('selectColor', $event.rgba)"
      @applyGradient="emit('applyGradient', $event)"
      @click.stop
    />
  </div>
</template>

<script lang="ts" setup>
import { ColorPicker, IRgba } from '@pubstudio/frontend/feature-color-picker'
import { IThemeVariable } from '@pubstudio/shared/type-site'
import ToolbarItem from './ToolbarItem.vue'

withDefaults(
  defineProps<{
    tooltip?: string | undefined
    showPicker?: boolean
    color?: string | undefined
    gradient?: string | undefined
    selectedThemeColors: IThemeVariable[]
  }>(),
  {
    tooltip: undefined,
    showPicker: false,
    color: undefined,
    gradient: undefined,
  },
)
const emit = defineEmits<{
  (e: 'click', event: Event): void
  (e: 'selectColor', color: IRgba): void
  (e: 'applyGradient', gradient: string): void
}>()
</script>
