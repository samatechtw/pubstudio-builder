<template>
  <Transition name="fade">
    <div v-if="show" class="toolbar-container">
      <ToolbarItem
        :active="isWrap"
        :tooltip="t('style.toolbar.flex_wrap')"
        @click="toggleWrap"
      >
        <FlexWrap />
      </ToolbarItem>
      <ToolbarItem
        :active="isColumn"
        :tooltip="t('style.toolbar.flex_vertical')"
        @click="toggleDirection('column')"
      >
        <FlexColumn />
      </ToolbarItem>
      <ToolbarItem
        :active="isRow"
        :tooltip="t('style.toolbar.flex_horizontal')"
        @click="toggleDirection('row')"
      >
        <FlexRow />
      </ToolbarItem>
      <ToolbarItemDropdown :items="alignHorizontalItems" />
      <ToolbarItemDropdown :items="alignVerticalItems" />
      <ToolbarColorPicker
        :tooltip="t('style.toolbar.background_color')"
        :color="getRawOrSelectedStyle(Css.BackgroundColor)"
        :gradient="getRawStyle(Css.Background)"
        :showPicker="showBackgroundPicker"
        :selectedThemeColors="selectedThemeColors"
        class="toolbar-menu"
        @selectColor="setBackgroundColor($event)"
        @applyGradient="setGradientBackground($event)"
        @click.stop="togglePicker(!showBackgroundPicker)"
      >
        <BackgroundColor :fill="iconColor" />
      </ToolbarColorPicker>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { computed, markRaw } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  AlignBottom,
  AlignCenter,
  AlignCenterVertical,
  AlignLeft,
  AlignRight,
  AlignTop,
  BackgroundColor,
  FlexRow,
  FlexColumn,
  FlexWrap,
  ToolbarItem,
  ToolbarItemDropdown,
  IToolbarDropdownItem,
} from '@pubstudio/frontend/ui-widgets'
import { colorToCssValue } from '@pubstudio/frontend/feature-color-picker'
import {
  GradientTypeValues,
  IThemedGradient,
  parseGradientColors,
} from '@pubstudio/frontend/util-gradient'
import { useControlledClickaway } from '@pubstudio/frontend/util-clickaway'
import { Css, StyleToolbarMenu } from '@pubstudio/shared/type-site'
import { ICommand } from '@pubstudio/shared/type-command'
import { useBuild, useToolbar, useThemeColors } from '@pubstudio/frontend/feature-build'
import { setStyleToolbarMenu } from '@pubstudio/frontend/util-command'
import ToolbarColorPicker from './ToolbarColorPicker.vue'
import { IToolbarPickerColor } from './i-toolbar-color-picker'

const { t } = useI18n()

const {
  selectionStyles,
  getRawStyle,
  getRawOrSelectedStyle,
  getStyleValue,
  setStyle,
  createSetComponentCustomStyleCommand,
  setProseMirrorStyle,
  refocusSelection,
} = useToolbar()
const { editor, pushGroupCommands } = useBuild()
const { selectedThemeColors } = useThemeColors()

const setBackgroundColor = (pickerColor: IToolbarPickerColor | undefined) => {
  const { selectedComponent } = editor.value ?? {}

  const editView = editor.value?.editView
  if (editView && pickerColor?.textWasFocused) {
    refocusSelection()
    setProseMirrorStyle(editView, Css.BackgroundColor, colorToCssValue(pickerColor))
  } else if (selectedComponent) {
    const cmdList: (ICommand | undefined)[] = []
    const background = getStyleValue(Css.Background)
    const backgroundClip = getStyleValue(Css.WebkitBackgroundClip)
    const textFillColor = getStyleValue(Css.WebkitTextFillColor)

    const setBackgroundColorCommand = createSetComponentCustomStyleCommand(
      Css.BackgroundColor,
      colorToCssValue(pickerColor),
    )
    cmdList.push(setBackgroundColorCommand)

    const gradientBackgroundApplied = GradientTypeValues.some(
      (gradientType) => background?.startsWith(gradientType),
    )

    if (gradientBackgroundApplied) {
      // Remove background because color-background and gradient-background are mutually exclusive
      const removeBackgroundCommand = createSetComponentCustomStyleCommand(
        Css.Background,
        undefined,
      )
      cmdList.push(removeBackgroundCommand)

      const textGradientApplied =
        backgroundClip === 'text' && textFillColor === 'transparent'

      if (textGradientApplied) {
        // Remove -webkit-background-clip and -webkit-text-fill-color because they will
        // make the gradient be applied to text content instead of element background.
        const removeBackgroundClipCommand = createSetComponentCustomStyleCommand(
          Css.WebkitBackgroundClip,
          undefined,
        )
        const removeTextFillColorCommand = createSetComponentCustomStyleCommand(
          Css.WebkitTextFillColor,
          undefined,
        )
        cmdList.push(removeBackgroundClipCommand, removeTextFillColorCommand)
      }
    }

    const commands = cmdList.filter((c) => !!c) as ICommand[]
    pushGroupCommands({ commands })
  }

  setStyleToolbarMenu(editor.value, undefined)
}

const setGradientBackground = (themedGradient: IThemedGradient | undefined) => {
  const { selectedComponent } = editor.value ?? {}

  if (selectedComponent) {
    const backgroundColor = getStyleValue(Css.BackgroundColor)
    const backgroundClip = getStyleValue(Css.WebkitBackgroundClip)

    const setBackgroundCommand = createSetComponentCustomStyleCommand(
      Css.Background,
      themedGradient?.themed ?? themedGradient?.raw,
    )
    const cmdList = [setBackgroundCommand]

    if (backgroundColor) {
      // Remove background-color because background and background-color are mutually exclusive
      const removeBackgroundColorCommand = createSetComponentCustomStyleCommand(
        Css.BackgroundColor,
        undefined,
      )
      cmdList.push(removeBackgroundColorCommand)
    }

    if (backgroundClip === 'text') {
      // Remove -webkit-background-clip when its' value is 'text' to make gradient apply to
      // element background instead of text content.
      const removeBackgroundClipCommand = createSetComponentCustomStyleCommand(
        Css.WebkitBackgroundClip,
        undefined,
      )
      cmdList.push(removeBackgroundClipCommand)
    }

    const commands = cmdList.filter((c) => !!c) as ICommand[]
    pushGroupCommands({ commands })
  }

  setStyleToolbarMenu(editor.value, undefined)
}

const { activate, deactivate } = useControlledClickaway(
  '.color-picker-wrap',
  () => togglePicker(false),
  true,
)

const showBackgroundPicker = computed(() => {
  return editor.value?.styleMenu === StyleToolbarMenu.BackgroundColor
})

// Sets a style, or un-sets it if the current value matches the new one.
const toggleStyle = (prop: Css, value: string) => {
  if (getStyleValue(prop) === value) {
    setStyle(prop, undefined)
  } else {
    setStyle(prop, value)
  }
}

const togglePicker = (show: boolean) => {
  if (show) {
    setStyleToolbarMenu(editor.value, StyleToolbarMenu.BackgroundColor)
    activate()
  } else {
    setStyleToolbarMenu(editor.value, undefined)
    deactivate()
  }
}

const ensureFlex = () => {
  if (getStyleValue(Css.Display) !== 'flex') {
    setStyle(Css.Display, 'flex')
  }
}

const isWrap = computed(() => {
  return getStyleValue(Css.FlexWrap) === 'wrap'
})

const toggleWrap = () => {
  ensureFlex()
  const value = isWrap.value ? undefined : 'wrap'
  setStyle(Css.FlexWrap, value)
}

const isColumn = computed(() => {
  return getStyleValue(Css.FlexDirection) === 'column'
})

const isRow = computed(() => {
  return getStyleValue(Css.FlexDirection) === 'row'
})

const toggleDirection = (value: string) => {
  ensureFlex()
  toggleStyle(Css.FlexDirection, value)
}

const isNonFlexTextComponent = () => {
  if (getStyleValue(Css.Display) === 'flex') {
    return false
  }
  const { selectedComponent } = editor.value ?? {}
  return !!selectedComponent?.content
}

const toggleTextAlign = (value: string) => {
  toggleStyle(Css.TextAlign, value)
}

const alignHorizontalProp = computed(() => {
  return isColumn.value ? Css.AlignItems : Css.JustifyContent
})

const isAlignLeft = computed(() => {
  if (isNonFlexTextComponent()) {
    return getStyleValue(Css.TextAlign) === 'left'
  }
  return getStyleValue(alignHorizontalProp.value) === 'flex-start'
})

const toggleAlignLeft = () => {
  if (isNonFlexTextComponent()) {
    toggleTextAlign('left')
  } else {
    ensureFlex()
    const value = isAlignLeft.value ? undefined : 'flex-start'
    setStyle(alignHorizontalProp.value, value)
  }
}

const isAlignCenter = computed(() => {
  if (isNonFlexTextComponent()) {
    return getStyleValue(Css.TextAlign) === 'center'
  }
  return getStyleValue(alignHorizontalProp.value) === 'center'
})

const toggleAlignCenter = () => {
  if (isNonFlexTextComponent()) {
    toggleTextAlign('center')
  } else {
    ensureFlex()
    const value = isAlignCenter.value ? undefined : 'center'
    setStyle(alignHorizontalProp.value, value)
  }
}

const isAlignRight = computed(() => {
  if (isNonFlexTextComponent()) {
    return getStyleValue(Css.TextAlign) === 'right'
  }
  return getStyleValue(alignHorizontalProp.value) === 'flex-end'
})

const toggleAlignRight = () => {
  if (isNonFlexTextComponent()) {
    toggleTextAlign('right')
  } else {
    ensureFlex()
    const value = isAlignRight.value ? undefined : 'flex-end'
    setStyle(alignHorizontalProp.value, value)
  }
}

const alignHorizontalItems: IToolbarDropdownItem[] = [
  {
    active: isAlignLeft,
    icon: markRaw(AlignLeft),
    tooltip: t('style.toolbar.align_left'),
    click: toggleAlignLeft,
  },
  {
    active: isAlignCenter,
    icon: markRaw(AlignCenter),
    tooltip: t('style.toolbar.align_center'),
    click: toggleAlignCenter,
  },
  {
    active: isAlignRight,
    icon: markRaw(AlignRight),
    tooltip: t('style.toolbar.align_right'),
    click: toggleAlignRight,
  },
]

const alignVerticalProp = computed(() => {
  return isColumn.value ? Css.JustifyContent : Css.AlignItems
})

const isAlignTop = computed(() => {
  return getStyleValue(alignVerticalProp.value) === 'flex-start'
})

const toggleAlignTop = () => {
  ensureFlex()
  const value = isAlignTop.value ? undefined : 'flex-start'
  setStyle(alignVerticalProp.value, value)
}

const isAlignCenterVertical = computed(() => {
  return getStyleValue(alignVerticalProp.value) === 'center'
})

const toggleAlignCenterVertical = () => {
  ensureFlex()
  const value = isAlignCenterVertical.value ? undefined : 'center'
  setStyle(alignVerticalProp.value, value)
}

const isAlignBottom = computed(() => {
  return getStyleValue(alignVerticalProp.value) === 'flex-end'
})

const toggleAlignBottom = () => {
  ensureFlex()
  const value = isAlignBottom.value ? undefined : 'flex-end'
  setStyle(alignVerticalProp.value, value)
}

const alignVerticalItems: IToolbarDropdownItem[] = [
  {
    active: isAlignTop,
    icon: markRaw(AlignTop),
    tooltip: t('style.toolbar.align_top'),
    click: toggleAlignTop,
  },
  {
    active: isAlignCenterVertical,
    icon: markRaw(AlignCenterVertical),
    tooltip: t('style.toolbar.align_center_vertical'),
    click: toggleAlignCenterVertical,
  },
  {
    active: isAlignBottom,
    icon: markRaw(AlignBottom),
    tooltip: t('style.toolbar.align_bottom'),
    click: toggleAlignBottom,
  },
]

const iconColor = computed(() => {
  const view = editor.value?.editView
  if (view && selectionStyles[Css.BackgroundColor]) {
    return selectionStyles[Css.BackgroundColor]
  }
  const backgroundColor = getStyleValue(Css.BackgroundColor)
  const background = getStyleValue(Css.Background)
  const gradientColors = parseGradientColors(background)
  return gradientColors[0]?.rgba ?? backgroundColor
})

defineProps<{
  show: boolean
}>()
</script>

<style lang="postcss" setup>
@import '@theme/css/mixins.postcss';

.background-item {
  position: relative;
}

.background-color {
  top: 100%;
  left: 20px;
}
</style>
