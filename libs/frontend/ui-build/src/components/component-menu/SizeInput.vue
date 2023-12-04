<template>
  <div class="size-input-wrap">
    <input
      ref="inputRef"
      class="size-input"
      :class="{ invalid }"
      :value="parsedSize.value"
      type="text"
      :name="`input${uid}`"
      @input="handleInput"
      @focusout="update"
      @keyup.enter="update"
      @keyup.esc="inputRef.blur()"
    />
    <div class="size-unit-wrap">
      <div ref="toggleRef" class="size-unit" @click="toggleMenu">
        {{ parsedSize.unit }}
      </div>
      <div
        ref="menuRef"
        class="ps-dropdown unit-dropdown"
        :class="{ 'ps-dropdown-opened': opened }"
        :style="menuStyle"
      >
        <div
          v-for="unit in units"
          :key="unit"
          class="unit-option"
          @click="selectUnit(unit)"
        >
          {{ unit }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref, toRefs } from 'vue'
import { uidSingleton } from '@pubstudio/frontend/util-doc'
import { useDropdown } from '@pubstudio/frontend/util-dropdown'
import { Css } from '@pubstudio/shared/type-site'
import { useToolbar, useBuild } from '@pubstudio/frontend/feature-build'

const uid = uidSingleton.next()
const { editor } = useBuild()
const { getStyleValue } = useToolbar()

const { toggleRef, menuRef, opened, menuStyle, setMenuOpened, toggleMenu } = useDropdown({
  clickawayIgnoreSelector: '.size-unit-wrap',
  offset: { crossAxis: 24, mainAxis: 4 },
})

const props = defineProps<{
  cssProp: Css
}>()
const { cssProp } = toRefs(props)
const emit = defineEmits<{
  (e: 'update', size: string | undefined): void
}>()

type SizeUnit = 'px' | '%' | 'em' | 'rem' | 'vw' | 'vh' | 'auto' | '-'

interface ISize {
  value: string
  unit: SizeUnit
}

const units: SizeUnit[] = ['px', '%', 'em', 'rem', 'vw', 'vh', 'auto', '-']
const sizeRegex = new RegExp(`^([0-9.]*)((?:${units.join(')|(?:')}))$`, 'i')

const inputRef = ref()
const invalid = ref(false)

const parseSize = (): ISize => {
  const str = getStyleValue(cssProp.value)
  const matches = (str ?? '').match(sizeRegex)
  let unit = (matches?.[2] ?? '-') as SizeUnit
  let value = matches?.[1] ?? ''
  if (unit === 'auto') {
    value = 'auto'
    unit = '-'
  }
  return { value, unit }
}

const parsedSize = ref<ISize>(parseSize())

const update = () => {
  const { unit, value } = parsedSize.value
  if (unit === '-') {
    emit('update', undefined)
    return
  }
  if (!unit) {
    parsedSize.value.unit = 'px'
  }
  const newSize = unit === 'auto' ? unit : `${value}${parsedSize.value.unit}`
  if (getStyleValue(cssProp.value) === newSize) {
    // Don't update if value didn't change
  } else if (sizeRegex.test(newSize)) {
    emit('update', newSize)
  } else {
    invalid.value = true
  }
}

const setInputValue = (val: string) => {
  if (inputRef.value) {
    ;(inputRef.value as HTMLInputElement).value = val ?? ''
  }
}

const handleInput = (e: Event) => {
  invalid.value = false
  const newValue = (e.target as HTMLInputElement)?.value
  const newChars = newValue.slice(parsedSize.value.value.length)
  if (newChars && !/^(\d|\.)*$/.test(newChars)) {
    setInputValue(parsedSize.value.value)
    return
  }
  parsedSize.value.value = newValue
  if (newValue && parsedSize.value.unit === '-') {
    parsedSize.value.unit = 'px'
  }
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

const selectUnit = (unit: SizeUnit) => {
  const prevUnit = parsedSize.value.unit
  if (prevUnit !== unit) {
    if (unit === 'px') {
      parsedSize.value.value = componentSize()
    }
    parsedSize.value.unit = unit
    update()
    setMenuOpened(false)
  }
}

watch(
  () => getStyleValue(cssProp.value),
  () => {
    parsedSize.value = parseSize()
  },
)

onMounted(() => {
  parsedSize.value = parseSize()
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.size-input-wrap {
  display: flex;
  .unit-dropdown {
    width: auto;
    cursor: pointer;
  }
}
.size-input {
  width: 38px;
  &.invalid {
    outline: none;
    border-radius: 2px;
    border: 1px solid $color-error;
  }
}
.size-unit-wrap {
  @mixin title 11px;
  display: flex;
  align-items: center;
  margin-left: 2px;
  color: $color-primary;
}
.size-unit {
  cursor: pointer;
  padding-top: 2px;
  width: 24px;
}
.unit-option {
  padding: 4px 12px 6px;
  &:hover {
    background-color: $border1;
  }
}
</style>
