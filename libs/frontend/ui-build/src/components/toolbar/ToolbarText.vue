<template>
  <Transition name="fade">
    <div v-if="show">
      <ToolbarItem
        :active="isUnderline"
        :tooltip="t('style.toolbar.underline')"
        class="underline"
        @mousedown.prevent
        @click="toggleTextDecoration('underline')"
      >
        <Underline />
      </ToolbarItem>
      <ToolbarItem
        :active="isItalic"
        :tooltip="t('style.toolbar.italic')"
        @mousedown.prevent
        @click="toggleFontStyle('italic')"
      >
        <Italic />
      </ToolbarItem>
      <ToolbarColorPicker
        :tooltip="t('style.toolbar.font_color')"
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
      <FontFamily @mousedown.prevent />
      <FontWeight :fontFamily="fontFamily" @mousedown.prevent />
      <PSInput
        ref="fontSizePsInputRef"
        v-model="fontSize.size"
        type="number"
        :maxLength="3"
        class="font-size"
        @keyup.enter.stop="setFontSize"
      >
        <PSMultiselect
          :value="fontSize.unit"
          :options="fontUnits"
          class="font-unit"
          @select="setFontUnit"
        />
      </PSInput>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  FontColor,
  Italic,
  PSMultiselect,
  ToolbarItem,
  Underline,
} from '@pubstudio/frontend/ui-widgets'
import { PSInput } from '@pubstudio/frontend/ui-widgets'
import { useControlledClickaway } from '@pubstudio/frontend/util-clickaway'
import { IPickerColor, colorToCssValue } from '@pubstudio/frontend/feature-color-picker'
import { Css, StyleToolbarMenu } from '@pubstudio/shared/type-site'
import {
  IThemedGradient,
  isTextGradient,
  parseGradientColors,
} from '@pubstudio/frontend/util-gradient'
import { ICommand } from '@pubstudio/shared/type-command'
import FontFamily from '../FontFamily.vue'
import FontWeight from '../FontWeight.vue'
import {
  useBuild,
  useToolbar,
  useThemeColors,
  useToolbarFontSize,
} from '@pubstudio/frontend/feature-build'
import { setStyleToolbarMenu } from '@pubstudio/frontend/feature-editor'
import ToolbarColorPicker from './ToolbarColorPicker.vue'

const { t } = useI18n()
const {
  selectionStyles,
  isProsemirrorEditing,
  getRawStyle,
  getRawOrSelectedStyle,
  getStyleValue,
  setStyle,
  setProseMirrorStyle,
  createSetComponentCustomStyleCommand,
  refocusSelection,
} = useToolbar()
const { editor, pushGroupCommands } = useBuild()
const { selectedThemeColors } = useThemeColors()
const { fontSizePsInputRef, fontSize, setFontSize, setFontUnit } = useToolbarFontSize()

defineProps<{
  show: boolean
}>()

const { activate, deactivate } = useControlledClickaway(
  '.color-picker-wrap',
  () => togglePicker(false),
  true,
)

const fontUnits = ['px', 'em', 'rem', '%']

const setFontColor = (pickerColor: IPickerColor | undefined) => {
  const { selectedComponent } = editor.value ?? {}

  const editView = editor.value?.editView
  refocusSelection()
  if (editView?.hasFocus()) {
    setProseMirrorStyle(editView, Css.Color, colorToCssValue(pickerColor))
  } else if (selectedComponent) {
    const cmdList: (ICommand | undefined)[] = []
    const background = getStyleValue(Css.Background)
    const backgroundClip = getStyleValue(Css.WebkitBackgroundClip)
    const textFillColor = getStyleValue(Css.WebkitTextFillColor)

    const setColorCommand = createSetComponentCustomStyleCommand(
      Css.Color,
      colorToCssValue(pickerColor),
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

  setStyleToolbarMenu(editor.value, undefined)
}

const setGradient = (themedGradient: IThemedGradient | undefined) => {
  const { selectedComponent } = editor.value ?? {}

  if (selectedComponent) {
    // Remove color from text because text-color and text-gradient are mutually exclusive
    const removeColorCommand = createSetComponentCustomStyleCommand(Css.Color, undefined)

    const setBackgroundCommand = createSetComponentCustomStyleCommand(
      Css.Background,
      themedGradient?.themed ?? themedGradient?.raw,
    )

    const setBackgroundClipCommand = createSetComponentCustomStyleCommand(
      Css.WebkitBackgroundClip,
      themedGradient ? 'text' : undefined,
    )

    const setTextFillColorCommand = createSetComponentCustomStyleCommand(
      Css.WebkitTextFillColor,
      themedGradient ? 'transparent' : undefined,
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

  setStyleToolbarMenu(editor.value, undefined)
}

const showColorPicker = computed(() => {
  return editor.value?.styleMenu === StyleToolbarMenu.TextColor
})

const togglePicker = (show: boolean) => {
  if (show) {
    setStyleToolbarMenu(editor.value, StyleToolbarMenu.TextColor)
    activate()
  } else {
    setStyleToolbarMenu(editor.value, undefined)
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
  if (getStyleValue(Css.TextDecoration) === value) {
    setStyle(Css.TextDecoration, undefined)
  } else {
    setStyle(Css.TextDecoration, value)
  }
}

const isItalic = computed(() => {
  return getEditorOrSelectedStyle(Css.FontStyle) === 'italic'
})

const toggleFontStyle = (value: string) => {
  if (getStyleValue(Css.FontStyle) === value) {
    setStyle(Css.FontStyle, undefined)
  } else {
    setStyle(Css.FontStyle, value)
  }
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
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.underline {
  margin-left: 16px;
}

.font-size {
  display: flex;
  margin-left: 4px;
  :deep(.ps-input) {
    border: 1px solid $color-light1;
    width: 70px;
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
  :deep(.label-text) {
    overflow: visible;
  }
  :deep(.ms-item) {
    padding: 4px 4px 3px;
  }
  :deep(.label) {
    padding: 4px 4px 3px 5px;
  }
}
</style>
