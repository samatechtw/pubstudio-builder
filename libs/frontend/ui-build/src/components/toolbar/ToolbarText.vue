<template>
  <div class="toolbar-text" :class="{ show }">
    <div class="toolbar-text-row">
      <FontFamily @mousedown.prevent />
      <FontWeight :fontFamily="fontFamily" @mousedown.prevent />
    </div>
    <div class="toolbar-text-row">
      <ToolbarItem
        :active="isUnderline"
        :tooltip="t('toolbar.underline')"
        class="underline"
        @mousedown.prevent
        @click="toggleTextDecoration('underline')"
      >
        <Underline />
      </ToolbarItem>
      <ToolbarItem
        :active="isItalic"
        :tooltip="t('toolbar.italic')"
        @mousedown.prevent
        @click="toggleFontStyle('italic')"
      >
        <Italic />
      </ToolbarItem>
      <ToolbarColorPicker
        :tooltip="t('toolbar.font_color')"
        :color="getRawOrSelectedStyle(Css.Color)"
        :gradient="getRawStyle(Css.Background)"
        :forceNonGradient="isProsemirrorEditing"
        :showPicker="showColorPicker"
        :selectedThemeColors="selectedThemeColors"
        @selectColor="setFontColor($event)"
        @applyGradient="setGradient($event)"
        @click.stop="togglePicker(!showColorPicker)"
      >
        <FontColor :color="iconColor" />
      </ToolbarColorPicker>
      <STInput
        ref="fontSizeRef"
        v-model="fontSize.size"
        type="number"
        :maxLength="3"
        class="font-size"
        @keyup.enter.stop="setFontSize"
        @mousedown="fontSizeTextFocus.toolbarButtonMouseDown"
      >
        <STMultiselect
          :value="fontSize.unit"
          :options="fontUnits"
          class="font-unit"
          @select="setFontUnit"
        />
      </STInput>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput, STMultiselect, useControlledClickaway } from '@samatech/vue-components'
import { FontColor, Italic, ToolbarItem, Underline } from '@pubstudio/frontend/ui-widgets'
import { colorToCssValue } from '@samatech/vue-color-picker'
import { Css, EditorDropdown } from '@pubstudio/shared/type-site'
import { isTextGradient, parseGradientColors } from '@samatech/vue-color-picker'
import { ICommand } from '@pubstudio/shared/type-command'
import {
  useBuild,
  useToolbar,
  useThemeColors,
  useToolbarFontSize,
} from '@pubstudio/frontend/feature-build'
import { setEditorDropdown } from '@pubstudio/frontend/data-access-command'
import ToolbarColorPicker from './ToolbarColorPicker.vue'
import { IToolbarPickerColor, IToolbarThemedGradient } from './i-toolbar-color-picker'
import FontFamily from '../FontFamily.vue'
import FontWeight from '../FontWeight.vue'

const { t } = useI18n()
const {
  selectionStyles,
  isProsemirrorEditing,
  getRawStyle,
  getRawOrSelectedStyle,
  getStyleValue,
  toggleStyle,
  setProseMirrorStyle,
  createSetComponentCustomStyleCommand,
  refocusSelection,
} = useToolbar()
const { editor, pushGroupCommands } = useBuild()
const { selectedThemeColors } = useThemeColors()
const { fontSize, setFontSize, setFontUnit, fontSizeTextFocus } = useToolbarFontSize()
const { toolbarItemRef: fontSizeRef } = fontSizeTextFocus

defineProps<{
  show: boolean
}>()

const { activate, deactivate } = useControlledClickaway(
  '.color-picker-wrap',
  () => togglePicker(false),
  true,
)

const fontUnits = ['px', 'em', 'rem', '%']

const setFontColor = (pickerColor: IToolbarPickerColor) => {
  const { selectedComponent } = editor.value ?? {}

  const editView = editor.value?.editView
  if (editView && pickerColor.textWasFocused) {
    refocusSelection()
    setProseMirrorStyle(editView, Css.Color, colorToCssValue(pickerColor.color, true))
  } else if (selectedComponent) {
    const cmdList: (ICommand | undefined)[] = []
    const background = getStyleValue(Css.Background)
    const backgroundClip = getStyleValue(Css.WebkitBackgroundClip)
    const textFillColor = getStyleValue(Css.WebkitTextFillColor)

    const setColorCommand = createSetComponentCustomStyleCommand(
      Css.Color,
      colorToCssValue(pickerColor.color, false),
    )
    cmdList.push(setColorCommand)

    const textGradientApplied = isTextGradient(background, backgroundClip, textFillColor)

    if (textGradientApplied) {
      // Remove text gradient (background) because text-color and text-gradient are mutually exclusive
      const removeBackgroundCommand = createSetComponentCustomStyleCommand(
        Css.Background,
        undefined,
      )

      const removeBackgroundClipCommand = createSetComponentCustomStyleCommand(
        Css.WebkitBackgroundClip,
        undefined,
      )

      const removeTextFillColorCommand = createSetComponentCustomStyleCommand(
        Css.WebkitTextFillColor,
        undefined,
      )

      cmdList.push(
        removeBackgroundCommand,
        removeBackgroundClipCommand,
        removeTextFillColorCommand,
      )
    }

    const commands = cmdList.filter((c) => !!c) as ICommand[]
    pushGroupCommands({ commands })
  }

  setEditorDropdown(editor.value, undefined)
}

const setGradient = (pickerGradient: IToolbarThemedGradient) => {
  const { selectedComponent } = editor.value ?? {}

  if (selectedComponent) {
    // Remove color from text because text-color and text-gradient are mutually exclusive
    const removeColorCommand = createSetComponentCustomStyleCommand(Css.Color, undefined)
    const gradient = pickerGradient.gradient

    const setBackgroundCommand = createSetComponentCustomStyleCommand(
      Css.Background,
      gradient?.themed ?? gradient?.raw,
    )

    const setBackgroundClipCommand = createSetComponentCustomStyleCommand(
      Css.WebkitBackgroundClip,
      gradient ? 'text' : undefined,
    )

    const setTextFillColorCommand = createSetComponentCustomStyleCommand(
      Css.WebkitTextFillColor,
      gradient ? 'transparent' : undefined,
    )

    const commands = [
      removeColorCommand,
      setBackgroundCommand,
      setBackgroundClipCommand,
      setTextFillColorCommand,
    ].filter((c) => !!c) as ICommand[]

    if (commands.length > 0) {
      pushGroupCommands({ commands })
    }
  }

  setEditorDropdown(editor.value, undefined)
}

const showColorPicker = computed(() => {
  return editor.value?.editorDropdown === EditorDropdown.TextColor
})

const togglePicker = (show: boolean) => {
  if (show) {
    setEditorDropdown(editor.value, EditorDropdown.TextColor)
    activate()
  } else {
    setEditorDropdown(editor.value, undefined)
    deactivate()
  }
}

const getEditorOrSelectedStyle = (property: Css): string | undefined => {
  const view = editor.value?.editView
  if (view) {
    return selectionStyles[property as keyof typeof selectionStyles]
  } else {
    return getStyleValue(property)
  }
}

const fontFamily = computed(() => {
  return getStyleValue(Css.FontFamily)
})

const isUnderline = computed(() => {
  return getEditorOrSelectedStyle(Css.TextDecoration) === 'underline'
})

const toggleTextDecoration = (value: string) => {
  toggleStyle(Css.TextDecoration, value)
}

const isItalic = computed(() => {
  return getEditorOrSelectedStyle(Css.FontStyle) === 'italic'
})

const toggleFontStyle = (value: string) => {
  toggleStyle(Css.FontStyle, value)
}

const iconColor = computed(() => {
  const view = editor.value?.editView
  if (view && selectionStyles[Css.Color]) {
    return selectionStyles[Css.Color]
  }
  const color = getStyleValue(Css.Color)
  const background = getStyleValue(Css.Background)
  const gradientColors = parseGradientColors(background)
  return gradientColors[0]?.rgba ?? color
})

onMounted(() => {
  if (showColorPicker.value) {
    activate()
  }
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.toolbar-text {
  @mixin flex-col;
  align-items: center;
  background-color: $blue-100;
  max-height: 0;
  opacity: 0;
  transition: all 0.2s ease;
  &.show {
    opacity: 1;
    max-height: 92px;
  }
}
.toolbar-text-row {
  @mixin flex-row;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  width: 100%;
  &:first-child {
    padding: 4px 0 3px;
  }
  &:last-child {
    padding: 3px 0 8px;
  }
}

.underline {
  margin-left: 16px;
}

.font-size {
  display: flex;
  margin-left: 16px;
  :deep(.st-input) {
    border: 1px solid $color-light1;
    width: 100px;
    height: 36px;
    background-color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    padding: 9px 0 7px 6px;
  }
}
.font-unit {
  width: 32px;
  right: 33px;
  top: 1px;
  height: 32px;
  border: none;
  background: transparent;
  :deep(.st-ms-label-text) {
    overflow: visible;
  }
  :deep(.ms-item) {
    padding: 4px 4px 3px;
  }
  :deep(.st-ms-label) {
    padding: 4px 4px 3px 5px;
  }
}
</style>
