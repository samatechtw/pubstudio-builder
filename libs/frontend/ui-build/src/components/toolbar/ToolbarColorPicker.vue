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
      :resolveThemeVar="resolveThemeVar"
      class="font-color"
      @selectColor="emit('selectColor', $event)"
      @applyGradient="emit('applyGradient', $event)"
      @click.stop
    />
  </div>
</template>

<script lang="ts" setup>
import { ColorPicker, IPickerColor } from '@pubstudio/frontend/feature-color-picker'
import { IThemeVariable } from '@pubstudio/shared/type-site'
import { IThemedGradient } from '@pubstudio/frontend/util-gradient'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import { ToolbarItem } from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'

const { site } = useBuild()

const resolveThemeVar = (themeVar: string): string | undefined => {
  return resolveThemeVariables(site.value.context, themeVar)
}

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
  (e: 'selectColor', color: IPickerColor): void
  (e: 'applyGradient', gradient: IThemedGradient): void
}>()
</script>
