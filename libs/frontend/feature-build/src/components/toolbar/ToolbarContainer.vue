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
      <SizeDropdown />
      <ToolbarColorPicker
        :tooltip="t('style.toolbar.background_color')"
        :color="getStyleValue(Css.BackgroundColor)"
        :gradient="getStyleValue(Css.Background)"
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
import { useI18n } from 'vue-i18n'
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
  ToolbarColorPicker,
  ToolbarItemDropdown,
  IToolbarDropdownItem,
} from '@pubstudio/frontend/ui-widgets'
import { IRgba } from '@pubstudio/frontend/feature-color-picker'
import {
  GradientTypeValues,
  parseGradientColors,
} from '@pubstudio/frontend/util-gradient'
import { setStyleToolbarMenu } from '@pubstudio/frontend/feature-editor'
import { useControlledClickaway } from '@pubstudio/frontend/util-clickaway'
import { Css, StyleToolbarMenu } from '@pubstudio/shared/type-site'
import { useToolbar } from '../../lib/use-toolbar'
import { useBuild } from '../../lib/use-build'
import { useThemeColors } from '../../lib/use-theme-colors'
import SizeDropdown from './SizeDropdown.vue'
import { ICommand } from '@pubstudio/shared/type-command'

const { t } = useI18n()

const { getStyleValue, setStyle, createSetComponentCustomStyleCommand } = useToolbar()
const { editor, pushGroupCommands } = useBuild()
const { selectedThemeColors } = useThemeColors()

const setBackgroundColor = (c: IRgba) => {
  const { selectedComponent } = editor.value ?? {}

  if (selectedComponent) {
    const commands: ICommand[] = []
    const color = c ? `rgba(${c.r},${c.g},${c.b},${c.a})` : undefined
    const background = getStyleValue(Css.Background)
    const backgroundColor = getStyleValue(Css.BackgroundColor)
    const backgroundClip = getStyleValue(Css.WebkitBackgroundClip)
    const textFillColor = getStyleValue(Css.WebkitTextFillColor)

    const setBackgroundColorCommand = createSetComponentCustomStyleCommand(
      Css.BackgroundColor,
      backgroundColor,
      color,
    )
    commands.push(setBackgroundColorCommand)

    const gradientBackgroundApplied = GradientTypeValues.some(
      (gradientType) => background?.startsWith(gradientType),
    )

    if (gradientBackgroundApplied) {
      // Remove background because color-background and gradient-background are mutually exclusive
      const removeBackgroundCommand = createSetComponentCustomStyleCommand(
        Css.Background,
        background,
        undefined,
      )
      commands.push(removeBackgroundCommand)

      const textGradientApplied =
        backgroundClip === 'text' && textFillColor === 'transparent'

      if (textGradientApplied) {
        // Remove -webkit-background-clip and -webkit-text-fill-color because they will
        // make the gradient be applied to text content instead of element background.
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
        commands.push(removeBackgroundClipCommand, removeTextFillColorCommand)
      }
    }

    pushGroupCommands({ commands })
  }

  setStyleToolbarMenu(editor.value, undefined)
}

const setGradientBackground = (gradient: string) => {
  const { selectedComponent } = editor.value ?? {}

  if (selectedComponent) {
    const commands: ICommand[] = []
    const background = getStyleValue(Css.Background)
    const backgroundColor = getStyleValue(Css.BackgroundColor)
    const backgroundClip = getStyleValue(Css.WebkitBackgroundClip)

    const setBackgroundCommand = createSetComponentCustomStyleCommand(
      Css.Background,
      background,
      gradient,
    )
    commands.push(setBackgroundCommand)

    if (backgroundColor) {
      // Remove background-color because background and background-color are mutually exclusive
      const removeBackgroundColorCommand = createSetComponentCustomStyleCommand(
        Css.BackgroundColor,
        backgroundColor,
        undefined,
      )
      commands.push(removeBackgroundColorCommand)
    }

    if (backgroundClip === 'text') {
      // Remove -webkit-background-clip when its' value is 'text' to make gradient apply to
      // element background instead of text content.
      const removeBackgroundClipCommand = createSetComponentCustomStyleCommand(
        Css.WebkitBackgroundClip,
        backgroundClip,
        undefined,
      )
      commands.push(removeBackgroundClipCommand)
    }

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
  if (getStyleValue(Css.FlexDirection) === value) {
    setStyle(Css.FlexDirection, undefined)
  } else {
    setStyle(Css.FlexDirection, value)
  }
}

const alignHorizontalProp = computed(() => {
  return isColumn.value ? Css.AlignItems : Css.JustifyContent
})

const isAlignLeft = computed(() => {
  return getStyleValue(alignHorizontalProp.value) === 'flex-start'
})

const toggleAlignLeft = () => {
  ensureFlex()
  const value = isAlignLeft.value ? undefined : 'flex-start'
  setStyle(alignHorizontalProp.value, value)
}

const isAlignCenter = computed(() => {
  return getStyleValue(alignHorizontalProp.value) === 'center'
})

const toggleAlignCenter = () => {
  ensureFlex()
  const value = isAlignCenter.value ? undefined : 'center'
  setStyle(alignHorizontalProp.value, value)
}

const isAlignRight = computed(() => {
  return getStyleValue(alignHorizontalProp.value) === 'flex-end'
})

const toggleAlignRight = () => {
  ensureFlex()
  const value = isAlignRight.value ? undefined : 'flex-end'
  setStyle(alignHorizontalProp.value, value)
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
