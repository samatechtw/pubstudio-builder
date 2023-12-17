<template>
  <div class="color-picker-wrap">
    <ToolbarItem
      ref="itemRef"
      :tooltip="tooltip"
      @click="emit('click', $event)"
      @mousedown="mousedown"
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
import { ref, toRefs } from 'vue'
import { ColorPicker, IPickerColor } from '@pubstudio/frontend/feature-color-picker'
import { IThemeVariable } from '@pubstudio/shared/type-site'
import { IThemedGradient } from '@pubstudio/frontend/util-gradient'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import { ToolbarItem } from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'
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
  (e: 'selectColor', color: IToolbarPickerColor | undefined): void
  (e: 'applyGradient', gradient: IToolbarThemedGradient | undefined): void
}>()

const itemRef = ref()
const prosemirrorWasFocused = ref(false)

const mouseup = (e: MouseEvent) => {
  document.removeEventListener('mouseup', mouseup)
  const clicked = itemRef.value.itemRef.contains(e.target)
  if (!clicked) {
    prosemirrorWasFocused.value = false
  }
}

const mousedown = () => {
  prosemirrorWasFocused.value = !!editor.value?.editView?.hasFocus()
  document.addEventListener('mouseup', mouseup)
}

const selectColor = (color: IPickerColor | undefined) => {
  const emitColor = color
    ? { ...color, prosemirrorWasFocused: prosemirrorWasFocused.value }
    : undefined
  emit('selectColor', emitColor)
}

const applyGradient = (gradient: IThemedGradient | undefined) => {
  const emitGradient = gradient
    ? { ...gradient, prosemirrorWasFocused: prosemirrorWasFocused.value }
    : undefined
  emit('applyGradient', emitGradient)
}
</script>
