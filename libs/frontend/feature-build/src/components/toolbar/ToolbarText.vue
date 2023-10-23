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
        :color="getStyleValue(Css.Color)"
        :gradient="getStyleValue(Css.Background)"
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
        ref="fontSizeRef"
        v-model="fontSize"
        type="number"
        suffix="px"
        :maxLength="3"
        class="font-size"
        @keyup.enter.stop="setFontSize"
      />
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { computed, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  FontColor,
  Italic,
  ToolbarColorPicker,
  ToolbarItem,
  Underline,
} from '@pubstudio/frontend/ui-widgets'
import { PSInput } from '@pubstudio/frontend/ui-widgets'
import { useControlledClickaway } from '@pubstudio/frontend/util-clickaway'
import { IRgba } from '@pubstudio/frontend/feature-color-picker'
import { Css, StyleToolbarMenu } from '@pubstudio/shared/type-site'
import {
  GradientTypeValues,
  parseGradientColors,
} from '@pubstudio/frontend/util-gradient'
import { ICommand } from '@pubstudio/shared/type-command'
import FontFamily from '../FontFamily.vue'
import FontWeight from '../FontWeight.vue'
import { useToolbar } from '../../lib/use-toolbar'
import { useBuild } from '../../lib/use-build'
import { useThemeColors } from '../../lib/use-theme-colors'
import { setStyleToolbarMenu } from '@pubstudio/frontend/feature-editor'

const { t } = useI18n()
const { getStyleValue, setStyle, createSetComponentCustomStyleCommand } = useToolbar()
const { editor, pushGroupCommands } = useBuild()
const { selectedThemeColors } = useThemeColors()

defineProps<{
  show: boolean
}>()

const fontSize = ref()
const fontSizeRef = ref()

const { activate, deactivate } = useControlledClickaway(
  '.color-picker-wrap',
  () => togglePicker(false),
  true,
)

const setFontColor = (c: IRgba) => {
  const { selectedComponent } = editor.value ?? {}

  if (selectedComponent) {
    const commands: ICommand[] = []
    const color = c ? `rgba(${c.r},${c.g},${c.b},${c.a})` : undefined
    const currentColor = getStyleValue(Css.Color)
    const background = getStyleValue(Css.Background)
    const backgroundClip = getStyleValue(Css.WebkitBackgroundClip)
    const textFillColor = getStyleValue(Css.WebkitTextFillColor)

    const setColorCommand = createSetComponentCustomStyleCommand(
      Css.Color,
      currentColor,
      color,
    )
    commands.push(setColorCommand)

    const gradientApplied = GradientTypeValues.some(
      (gradientType) => background?.startsWith(gradientType),
    )
    const textGradientApplied =
      gradientApplied && backgroundClip === 'text' && textFillColor === 'transparent'

    if (textGradientApplied) {
      // Remove text gradient (background) because text-color and text-gradient are mutually exclusive
      const removeBackgroundCommand = createSetComponentCustomStyleCommand(
        Css.Background,
        background,
        undefined,
      )

      const removeBackgroundClipCommand = createSetComponentCustomStyleCommand(
        Css.WebkitBackgroundClip,
        backgroundClip,
        undefined,
      )

      const removeTextFillColorCommand = createSetComponentCustomStyleCommand(
        Css.WebkitTextFillColor,
        textFillColor,
        undefined,
      )

      commands.push(
        removeBackgroundCommand,
        removeBackgroundClipCommand,
        removeTextFillColorCommand,
      )
    }

    pushGroupCommands({ commands })
  }

  setStyleToolbarMenu(editor.value, undefined)
}

const setGradient = (gradient: string) => {
  const { selectedComponent } = editor.value ?? {}

  if (selectedComponent) {
    const commands: ICommand[] = []
    const currentColor = getStyleValue(Css.Color)
    const background = getStyleValue(Css.Background)
    const backgroundClip = getStyleValue(Css.WebkitBackgroundClip)
    const textFillColor = getStyleValue(Css.WebkitTextFillColor)

    if (currentColor) {
      // Remove color from text because text-color and text-gradient are mutually exclusive
      const removeColorCommand = createSetComponentCustomStyleCommand(
        Css.Color,
        currentColor,
        undefined,
      )
      commands.push(removeColorCommand)
    }

    const setBackgroundCommand = createSetComponentCustomStyleCommand(
      Css.Background,
      background,
      gradient,
    )

    const setBackgroundClipCommand = createSetComponentCustomStyleCommand(
      Css.WebkitBackgroundClip,
      backgroundClip,
      'text',
    )

    const setTextFillColorCommand = createSetComponentCustomStyleCommand(
      Css.WebkitTextFillColor,
      textFillColor,
      'transparent',
    )

    commands.push(setBackgroundCommand, setBackgroundClipCommand, setTextFillColorCommand)

    pushGroupCommands({ commands })
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

const setFontSize = () => {
  try {
    const size = parseInt(fontSize.value)
    if (size > 1 && size < 1000) {
      setStyle(Css.FontSize, `${size}px`)
      fontSizeRef.value?.inputRef?.blur()
    }
  } catch (e) {
    console.log('Font size error:', e)
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

watch(
  () => [editor?.value?.selectedComponent, editor.value?.cssPseudoClass],
  () => {
    const size = getStyleValue(Css.FontSize)
    fontSize.value = size?.replace('px', '') ?? ''
  },
  {
    immediate: true,
  },
)
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.underline {
  margin-left: 32px;
}

.font-size {
  width: 72px;
  margin-left: 4px;
  :deep(.ps-input) {
    border: 1px solid $color-light1;
    background-color: rgba(255, 255, 255, 0.8);
    font-size: 15px;
    padding-right: 32px;
  }
}
</style>
