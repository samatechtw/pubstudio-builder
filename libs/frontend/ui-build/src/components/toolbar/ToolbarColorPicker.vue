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
      @selectColor="selectColor"
      @applyGradient="applyGradient"
      @click.stop
    />
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { ColorPicker, IPickerColor, IThemedGradient } from '@samatech/vue-color-picker'
import { IThemeVariable } from '@pubstudio/shared/type-site'
import { resolveThemeVariables } from '@pubstudio/frontend/util-resolve'
import { ToolbarItem } from '@pubstudio/frontend/ui-widgets'
import { useToolbarResumeTextFocus } from '@pubstudio/frontend/feature-build'
import { IToolbarPickerColor, IToolbarThemedGradient } from './i-toolbar-color-picker'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const { site, editor } = useSiteSource()

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

<style lang="postcss" scoped>
.color-picker-wrap {
  position: relative;
}
.color-picker {
  left: -24px;
}
</style>
