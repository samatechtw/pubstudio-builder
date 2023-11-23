<template>
  <Transition name="fade">
    <div v-if="show">
      <ToolbarItem
        :active="isUnderline"
        :tooltip="t('style.toolbar.underline')"
        class="underline"
        @click="toggleTextDecoration('underline')"
      >
        <Underline />
      </ToolbarItem>
      <ToolbarItem
        :active="isItalic"
        :tooltip="t('style.toolbar.italic')"
        @click="toggleFontStyle('italic')"
      >
        <Italic />
      </ToolbarItem>
      <ToolbarColorPicker
        :tooltip="t('style.toolbar.font_color')"
        :color="getRawStyle(Css.BackgroundColor)"
        :gradient="getRawStyle(Css.Background)"
        :showPicker="showColorPicker"
        :selectedThemeColors="selectedThemeColors"
        @selectColor="setFontColor($event)"
        @applyGradient="setGradient($event)"
        @click.stop="togglePicker(!showColorPicker)"
      >
        <FontColor :color="iconColor" />
      </ToolbarColorPicker>
      <FontFamily />
      <FontWeight :fontFamily="fontFamily" />
      <PSInput
        ref="fontSizePsInputRef"
        v-model="fontSize"
        type="number"
        :suffix="fontSizeSuffix"
        :maxLength="3"
        class="font-size"
        @keyup.enter.stop="setFontSize"
      />
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FontColor, Italic, ToolbarItem, Underline } from '@pubstudio/frontend/ui-widgets'
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
import { useToolbar } from '../../lib/use-toolbar'
import { useBuild } from '../../lib/use-build'
import { useThemeColors } from '../../lib/use-theme-colors'
import { setStyleToolbarMenu } from '@pubstudio/frontend/feature-editor'
import { useToolbarFontSize } from '../../lib/use-toolbar-font-size'
import ToolbarColorPicker from './ToolbarColorPicker.vue'

const { t } = useI18n()
const { getRawStyle, getStyleValue, setStyle, createSetComponentCustomStyleCommand } =
  useToolbar()
const { editor, pushGroupCommands } = useBuild()
const { selectedThemeColors } = useThemeColors()

defineProps<{
  show: boolean
}>()

const { activate, deactivate } = useControlledClickaway(
  '.color-picker-wrap',
  () => togglePicker(false),
  true,
)

const setFontColor = (pickerColor: IPickerColor) => {
  const { selectedComponent } = editor.value ?? {}

  if (selectedComponent) {
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

const setGradient = (themedGradient: IThemedGradient) => {
  const { raw, themed } = themedGradient
  const { selectedComponent } = editor.value ?? {}

  if (selectedComponent) {
    // Remove color from text because text-color and text-gradient are mutually exclusive
    const removeColorCommand = createSetComponentCustomStyleCommand(Css.Color, undefined)

    const setBackgroundCommand = createSetComponentCustomStyleCommand(
      Css.Background,
      themed ?? raw,
    )

    const setBackgroundClipCommand = createSetComponentCustomStyleCommand(
      Css.WebkitBackgroundClip,
      'text',
    )

    const setTextFillColorCommand = createSetComponentCustomStyleCommand(
      Css.WebkitTextFillColor,
      'transparent',
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

const fontFamily = computed(() => {
  return getStyleValue(Css.FontFamily)
})

const isUnderline = computed(() => {
  return getStyleValue(Css.TextDecoration) === 'underline'
})

const toggleTextDecoration = (value: string) => {
  if (getStyleValue(Css.TextDecoration) === value) {
    setStyle(Css.TextDecoration, undefined)
  } else {
    setStyle(Css.TextDecoration, value)
  }
}

const isItalic = computed(() => {
  return getStyleValue(Css.FontStyle) === 'italic'
})

const toggleFontStyle = (value: string) => {
  if (getStyleValue(Css.FontStyle) === value) {
    setStyle(Css.FontStyle, undefined)
  } else {
    setStyle(Css.FontStyle, value)
  }
}

const iconColor = computed(() => {
  const color = getStyleValue(Css.Color)
  const background = getStyleValue(Css.Background)
  const gradientColors = parseGradientColors(background)
  return gradientColors[0]?.rgba ?? color
})

const { fontSizePsInputRef, fontSize, fontSizeSuffix, setFontSize } = useToolbarFontSize()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.underline {
  margin-left: 32px;
}

.font-size {
  width: 76px;
  margin-left: 4px;
  :deep(.ps-input) {
    border: 1px solid $color-light1;
    background-color: rgba(255, 255, 255, 0.8);
    font-size: 15px;
    padding-right: 32px;
  }
  :deep(.ps-input-suffix) {
    user-select: none;
  }
}
</style>
