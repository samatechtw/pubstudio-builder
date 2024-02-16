<template>
  <div class="size-input-wrap">
    <div class="input-wrap" @click="clickInputWrap">
      <input
        ref="inputRef"
        class="size-input"
        :class="{ invalid, auto: isAuto }"
        :value="currentValue"
        type="text"
        :tabindex="rightMenuTabIndex"
        :name="`input${uid}`"
        @input="updateValue"
        @keydown="inputKeydown"
        @keyup.enter="update"
        @keyup.esc="inputRef?.blur()"
      />
    </div>
    <SizeUnit ref="unitRef" :size="parsedSize" @updateSize="selectUnit" />
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { uidSingleton } from '@pubstudio/frontend/util-doc'
import { Css } from '@pubstudio/shared/type-site'
import { useToolbar, useBuild, useCssSize } from '@pubstudio/frontend/feature-build'
import { rightMenuTabIndex } from '@pubstudio/frontend/util-runtime'
import { ICssSize } from '@pubstudio/frontend/util-component'
import { SizeUnit } from '@pubstudio/frontend/ui-widgets'

const uid = uidSingleton.next()
const { editor } = useBuild()
const { getStyleValue } = useToolbar()

const props = defineProps<{
  cssProp: Css
}>()
const { cssProp } = toRefs(props)
const emit = defineEmits<{
  (e: 'update', size: string | undefined): void
}>()

const getSize = () => getStyleValue(cssProp.value)

const {
  parsedSize,
  currentValue,
  isAuto,
  invalid,
  inputRef,
  unitRef,
  clickInputWrap,
  inputKeydown,
  handleInput,
  updatedSize,
} = useCssSize({
  getSize,
})

const update = () => {
  const sizeStr = updatedSize()
  if (sizeStr !== undefined) {
    emit('update', sizeStr)
  }
}

const updateValue = (e: Event) => {
  handleInput((e.target as HTMLInputElement)?.value)
  update()
}

const componentSize = (): string => {
  const id = editor.value?.selectedComponent?.id
  if (id) {
    const el = document.getElementById(id)
    if (el) {
      if ([Css.Width, Css.MinWidth, Css.MaxWidth].includes(cssProp.value)) {
        return el.offsetWidth.toString()
      } else if ([Css.Height, Css.MinHeight, Css.MaxHeight].includes(cssProp.value)) {
        return el.offsetHeight.toString()
      }
    }
  }
  return '0'
}

const selectUnit = (size: ICssSize) => {
  const prevUnit = parsedSize.value.unit
  parsedSize.value = { ...size }
  if (prevUnit !== 'px' && size.unit === 'px') {
    parsedSize.value.value = componentSize()
  }
  update()
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.size-input-wrap {
  display: flex;
}
.input-wrap {
  display: flex;
  cursor: pointer;
}
.size-input {
  @mixin input;
  @mixin text 12px;
  width: 38px;
  padding: 1px 2px 2px;
  height: 20px;
  border-radius: 4px;
  &.auto {
    cursor: pointer;
    pointer-events: none;
    text-align: center;
  }
  &.invalid {
    outline: none;
    border-radius: 2px;
    border: 1px solid $color-error;
  }
}
</style>
