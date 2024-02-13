<template>
  <div class="color-picker-wrap">
    <ToolbarItem
      ref="toolbarItemRef"
      :tooltip="tooltip"
      @click="emit('click', $event)"
      @mousedown="toolbarButtonMouseDown"
    >
      <slot />
    </ToolbarItem>
    <ColorPicker
      v-if="showPicker"
      :color="color"
      :gradient="gradient"
      :forceNonGradient="forceNonGradient"
      :selectedThemeColors="selectedThemeColors"
      :resolveThemeVar="resolveThemeVar"
      class="font-color"
      @selectColor="selectColor"
      @applyGradient="applyGradient"
      @click.stop
    />
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { ColorPicker, IPickerColor } from '@pubstudio/frontend/feature-color-picker'
import { IThemeVariable } from '@pubstudio/shared/type-site'
import { IThemedGradient } from '@pubstudio/frontend/util-gradient'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import { ToolbarItem } from '@pubstudio/frontend/ui-widgets'
import { useBuild, useToolbarResumeTextFocus } from '@pubstudio/frontend/feature-build'
import { IToolbarPickerColor, IToolbarThemedGradient } from './i-toolbar-color-picker'

const { site, editor } = useBuild()

const resolveThemeVar = (themeVar: string): string | undefined => {
  return resolveThemeVariables(site.value.context, themeVar)
}

const props = withDefaults(
  defineProps<{
    tooltip?: string | undefined
    showPicker?: boolean
    color?: string | undefined
    gradient?: string | undefined
    forceNonGradient?: boolean
    selectedThemeColors: IThemeVariable[]
  }>(),
  {
    tooltip: undefined,
    showPicker: false,
    color: undefined,
    gradient: undefined,
  },
)
const { showPicker } = toRefs(props)
const emit = defineEmits<{
  (e: 'click', event: Event): void
  (e: 'selectColor', color: IToolbarPickerColor): void
  (e: 'applyGradient', gradient: IToolbarThemedGradient): void
}>()

const { textWasFocused, toolbarItemRef, toolbarButtonMouseDown } =
  useToolbarResumeTextFocus({ editor })

const selectColor = (color: IPickerColor | undefined) => {
  const emitColor: IToolbarPickerColor = {
    color,
    textWasFocused: textWasFocused.value,
  }
  emit('selectColor', emitColor)
}

const applyGradient = (gradient: IThemedGradient | undefined) => {
  const emitGradient: IToolbarThemedGradient = {
    gradient,
    textWasFocused: textWasFocused.value,
  }
  emit('applyGradient', emitGradient)
}
</script>
