<template>
  <div class="component-truncate">
    <div class="truncate-title">
      {{ t('build.truncate') }}
    </div>
    <div class="truncate-items">
      <ToolbarItem
        :active="isNoWrapEllipsis"
        :tooltip="t('build.single_line')"
        @click="toggleNoWrapEllipsis"
      >
        <HorizontalEllipsis />
      </ToolbarItem>
      <ToolbarItem
        :active="isLineClamp"
        :tooltip="t('build.multi_line')"
        @click="toggleLineClamp"
      >
        <JustifyLeft />
      </ToolbarItem>
      <div v-if="isLineClamp" class="line-clamp-input-wrap">
        <div class="line-clamp-label">
          {{ t('build.lines') }}
        </div>
        <input
          class="line-clamp-input"
          type="number"
          min="1"
          step="1"
          :value="lineClampValue"
          @input="updateLineClamp"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  ToolbarItem,
  HorizontalEllipsis,
  JustifyLeft,
} from '@pubstudio/frontend/ui-widgets'
import {
  useToolbar,
  useBuild,
  IOldNewStyleEntry,
} from '@pubstudio/frontend/feature-build'
import { Css, IComponent } from '@pubstudio/shared/type-site'

const { t } = useI18n()
const { getStyleValue, setStyleOrReplace } = useToolbar()
const { editor, currentPseudoClass, setCustomStyles } = useBuild()

const isNoWrapEllipsis = computed(() => {
  return (
    getStyleValue(Css.Overflow) === 'hidden' &&
    getStyleValue(Css.WhiteSpace) === 'nowrap' &&
    getStyleValue(Css.TextOverflow) === 'ellipsis' &&
    getStyleValue(Css.Display) !== '-webkit-box'
  )
})

const toggleNoWrapEllipsis = () => {
  const selectedComponent = editor.value?.selectedComponent

  if (selectedComponent) {
    if (isNoWrapEllipsis.value) {
      removeNoWrapEllipsis(selectedComponent)
    } else {
      applyNoWrapEllipsis(selectedComponent)
    }
  }
}

const removeNoWrapEllipsis = (selectedComponent: IComponent) => {
  // Remove all nowrap-ellipsis related CSS properties from the custom style
  // of the selected component.
  const entries = [
    makeOldNewStyleEntry(Css.Overflow, undefined),
    makeOldNewStyleEntry(Css.WhiteSpace, undefined),
    makeOldNewStyleEntry(Css.TextOverflow, undefined),
  ]
  setCustomStyles(selectedComponent, entries)
}

const applyNoWrapEllipsis = (selectedComponent: IComponent) => {
  const setOverflowEntry = makeOldNewStyleEntry(Css.Overflow, 'hidden')
  const setWhiteSpaceEntry = makeOldNewStyleEntry(Css.WhiteSpace, 'nowrap')
  const setTextOverflowEntry = makeOldNewStyleEntry(Css.TextOverflow, 'ellipsis')

  const entries = [setOverflowEntry, setWhiteSpaceEntry, setTextOverflowEntry]

  const currentDisplay = getStyleValue(Css.Display)
  const currentBoxOrient = getStyleValue(Css.WebkitBoxOrient)
  const currentLineClamp = getStyleValue(Css.WebkitLineClamp)

  if (
    currentDisplay === '-webkit-box' ||
    currentDisplay === 'flex' ||
    currentDisplay === 'inline-flex'
  ) {
    // Remove `display` if the value is `-webkit-box`, `flex`, or `inline-flex`
    // for nowrap ellipsis to work.
    const removeDisplayEntry = makeOldNewStyleEntry(Css.Display, undefined)
    entries.push(removeDisplayEntry)
  }

  if (currentBoxOrient) {
    const removeBoxOrientEntry = makeOldNewStyleEntry(Css.WebkitBoxOrient, undefined)
    entries.push(removeBoxOrientEntry)
  }

  if (currentLineClamp) {
    const removeLineClampEntry = makeOldNewStyleEntry(Css.WebkitLineClamp, undefined)
    entries.push(removeLineClampEntry)
  }
  setCustomStyles(selectedComponent, entries)
}

const makeOldNewStyleEntry = (
  property: Css,
  newValue: string | undefined,
): IOldNewStyleEntry => {
  const entry: IOldNewStyleEntry = {}
  const currentValue = getStyleValue(property)

  if (currentValue) {
    entry.oldStyle = {
      property,
      pseudoClass: currentPseudoClass.value,
      value: currentValue,
    }
  }

  if (newValue) {
    entry.newStyle = {
      property,
      pseudoClass: currentPseudoClass.value,
      value: newValue,
    }
  }

  return entry
}

const isLineClamp = computed(() => {
  return (
    getStyleValue(Css.Display) === '-webkit-box' &&
    getStyleValue(Css.WebkitBoxOrient) === 'vertical' &&
    getStyleValue(Css.Overflow) === 'hidden'
  )
})

const toggleLineClamp = () => {
  const selectedComponent = editor.value?.selectedComponent

  if (selectedComponent) {
    if (isLineClamp.value) {
      removeLineClamp(selectedComponent)
    } else {
      applyLineClamp(selectedComponent)
    }
  }
}

const removeLineClamp = (selectedComponent: IComponent) => {
  // Remove all line clamp related CSS properties from the custom style
  // of the selected component.
  const entries = [
    makeOldNewStyleEntry(Css.Display, undefined),
    makeOldNewStyleEntry(Css.WebkitBoxOrient, undefined),
    makeOldNewStyleEntry(Css.Overflow, undefined),
    makeOldNewStyleEntry(Css.WebkitLineClamp, undefined),
  ]
  setCustomStyles(selectedComponent, entries)
}

const applyLineClamp = (selectedComponent: IComponent) => {
  const setDisplayEntry = makeOldNewStyleEntry(Css.Display, '-webkit-box')
  const setWhiteSpaceEntry = makeOldNewStyleEntry(Css.WebkitBoxOrient, 'vertical')
  const setOverflowEntry = makeOldNewStyleEntry(Css.Overflow, 'hidden')
  const setLineClampEntry = makeOldNewStyleEntry(Css.WebkitLineClamp, '3')

  const entries = [
    setDisplayEntry,
    setWhiteSpaceEntry,
    setWhiteSpaceEntry,
    setOverflowEntry,
    setLineClampEntry,
  ]

  const currentWhiteSpace = getStyleValue(Css.WhiteSpace)
  const currentTextOverflow = getStyleValue(Css.TextOverflow)

  if (currentWhiteSpace === 'nowrap') {
    // Remove `whitespace: nowrap` for `-webkit-line-clamp` to work.
    const removeWhiteSpaceEntry = makeOldNewStyleEntry(Css.WhiteSpace, undefined)
    entries.push(removeWhiteSpaceEntry)
  }

  if (currentTextOverflow === 'ellipsis') {
    const removeTextOverflowEntry = makeOldNewStyleEntry(Css.TextOverflow, undefined)
    entries.push(removeTextOverflowEntry)
  }

  setCustomStyles(selectedComponent, entries)
}

const lineClampValue = computed(() => getStyleValue(Css.WebkitLineClamp))

const updateLineClamp = (e: Event) => {
  const { value } = e.target as HTMLInputElement
  const formattedValue = formatLineClamp(value)
  setStyleOrReplace(Css.WebkitLineClamp, formattedValue.toString())
}

const formatLineClamp = (input: string): number => {
  let parsedInput = parseInt(input)
  if (Number.isNaN(parsedInput) || parsedInput <= 0) {
    parsedInput = 1
  }
  return parsedInput
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-truncate {
  @mixin flex-center;
  padding: 6px 4px;
  margin: 0 auto;
}
.truncate-title {
  @mixin title-bold 13px;
}
.truncate-items {
  display: flex;
  align-items: center;
  margin-left: 8px;
}
.line-clamp-input-wrap {
  @mixin flex-col;
  margin-left: 8px;
  .line-clamp-label {
    @mixin title-bold 11px;
    font-weight: 600;
    cursor: initial;
    user-select: none;
  }
  .line-clamp-input {
    @mixin input;
    @mixin text 12px;
    width: 60px;
    padding: 1px 4px 2px 4px;
    height: 20px;
    border-radius: 4px;
  }
}
</style>
