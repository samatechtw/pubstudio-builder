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
    <Teleport to="body">
      <ColorPicker
        v-if="showPicker"
        :color="color"
        :gradient="gradient"
        :forceNonGradient="forceNonGradient"
        :selectedThemeColors="selectedThemeColors"
        :resolveThemeVar="resolveThemeVar"
        class="toolbar-picker"
        :style="pickerPos"
        @selectColor="selectColor"
        @applyGradient="applyGradient"
        @click.stop
      />
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ColorPicker, IPickerColor, IThemedGradient } from '@samatech/vue-color-picker'
import { IThemeVariable } from '@pubstudio/shared/type-site'
import { resolveThemeVariables } from '@pubstudio/frontend/util-resolve'
import { ToolbarItem } from '@pubstudio/frontend/ui-widgets'
import { useToolbarResumeTextFocus } from '@pubstudio/frontend/feature-build'
import { IToolbarPickerColor, IToolbarThemedGradient } from './i-toolbar-color-picker'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { onMounted, ref, toRefs, watch } from 'vue'

const { site, editor } = useSiteSource()
const pickerPos = ref({})

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

const updatePickerPos = () => {
  const menuPos = document.getElementById('component-menu')?.getBoundingClientRect()
  if (menuPos && toolbarItemRef.value.$el) {
    const pos = toolbarItemRef.value.$el.getBoundingClientRect()
    pickerPos.value = {
      top: `${pos.top + 40}px`,
      left: `${menuPos.left - 44}px`,
    }
  }
}

watch(showPicker, (show) => {
  if (show) {
    updatePickerPos()
  }
})

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

onMounted(() => {
  updatePickerPos()
})
</script>

<style lang="postcss" scoped>
.color-picker-wrap {
  position: relative;
}
.toolbare-picker {
  position: absolute;
}
</style>
