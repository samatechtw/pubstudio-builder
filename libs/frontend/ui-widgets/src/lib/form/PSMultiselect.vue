<template>
  <div
    ref="multiselectRef"
    class="ps-multiselect"
    :class="{ disabled }"
    :data-toggle-id="dataToggleId"
    @click="toggleDropdown"
  >
    <div
      :ref="setToggleRef"
      class="label"
      @mouseenter="tooltipMouseEnter()"
      @mouseleave="tooltipMouseLeave"
    >
      <PSInput
        v-if="searchActive"
        ref="searchRef"
        :modelValue="search"
        :isDisabled="disabled"
        name="search"
        class="search"
        type="search"
        autocomplete="off"
        @update:modelValue="updateSearch"
        @keyup.enter.stop.prevent="searchEnter"
        @keydown="handleKeydown"
        @click.stop="toggleDropdown"
      />
      <div v-else-if="forceLabel ?? label" class="label-text">
        {{ forceLabel ?? label }}
      </div>
      <div v-else class="placeholder">
        {{ placeholder ?? '' }}
      </div>
      <div v-if="clearable && value" class="clear" @click.stop="clear">
        <Cross class="clear-icon" />
      </div>
      <div v-if="caret" class="caret" :class="{ opened }"></div>
    </div>
    <Transition name="slide">
      <div v-show="opened" ref="menuRef" class="dropdown" :style="menuStyle">
        <div
          v-for="(l, index) in labels"
          :key="(l ?? index).toString()"
          class="ms-item"
          :class="{ highlight: searchActive && index === searchIndex }"
          @click="select(index)"
        >
          <slot v-if="customLabel" :label="l" :index="index"></slot>
          <div v-else>
            {{ l }}
          </div>
        </div>
        <slot v-if="customSlot" name="customSlot" />
        <div
          v-else-if="!labels.length"
          class="ms-item no-options"
          @click="emit('selectEmpty')"
        >
          {{ emptyText ?? t('no_options') }}
        </div>
      </div>
    </Transition>
    <Teleport to="body">
      <div
        v-if="tooltip && !opened && showTooltip"
        ref="tooltipRef"
        class="multiselect-tooltip"
        :style="{ ...tooltipStyle }"
      >
        {{ tooltip }}
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup generic="T extends IMultiselectOption">
import { ComponentPublicInstance, computed, nextTick, onMounted, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { Placement } from '@floating-ui/vue'
import { useDropdown, observePlacementChange } from '@pubstudio/frontend/util-dropdown'
import { Keys, useKeyListener } from '@pubstudio/frontend/util-key-listener'
import { uidSingleton } from '@pubstudio/frontend/util-doc'
import { IMultiselectObj, IMultiselectOption } from '@pubstudio/frontend/type-ui-widgets'
import { useTooltipDelay } from '@pubstudio/frontend/util-tooltip'
import Cross from '../svg/Cross.vue'
import PSInput from './PSInput.vue'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    clearable?: boolean
    caret?: boolean
    searchable?: boolean
    disabled?: boolean
    options?: T[]
    // Overrides the active label. Useful to avoid including the selected entry in the list
    // TODO -- should we automatically filter out the selected value from options instead?
    forceLabel?: string
    // TODO -- implement multiple selection via array
    value: string | undefined
    labelKey?: string
    valueKey?: string
    placeholder?: string
    toggleId?: string
    tooltip?: string
    emptyText?: string
    // Adds a slot after options, instead of an option with `emptyText`
    customSlot?: boolean
    openInitial?: boolean
    // If true, the label is replaced with a slot
    customLabel?: boolean
    // Allow any search input to be selected, even if it's not in the list
    allowAny?: boolean
    openControl?: () => boolean
  }>(),
  {
    placeholder: undefined,
    openControl: undefined,
    toggleId: undefined,
    forceLabel: undefined,
    labelKey: 'label',
    valueKey: 'value',
    caret: true,
    options: () => [] as T[],
    tooltip: undefined,
    emptyText: undefined,
  },
)
const {
  labelKey,
  openInitial,
  openControl,
  options,
  searchable,
  disabled,
  toggleId,
  value,
  valueKey,
  allowAny,
} = toRefs(props)

const emit = defineEmits<{
  (e: 'select', value: T | undefined): void
  (e: 'selectEmpty'): void
  (e: 'open'): void
  (e: 'close'): void
  (e: 'keydown', event: KeyboardEvent): void
}>()

defineSlots<{
  default(props: { label: string; index: number }): void
  customSlot(): void
}>()

const dataToggleId = `toggle-${toggleId.value ?? uidSingleton.next()}`

const dropdownCurrentPlacement = ref<Placement>('bottom-end')

const dropdownTransformOrigin = computed(() => {
  if (dropdownCurrentPlacement.value === 'bottom-end') {
    return 'top'
  } else {
    return 'bottom'
  }
})

const {
  toggleRef,
  menuRef,
  opened,
  menuStyle,
  updateMenuPosition,
  setMenuOpened,
  toggleMenu,
} = useDropdown({
  clickawayIgnoreSelector: `div[data-toggle-id="${dataToggleId}"]`,
  offset: { mainAxis: 0, crossAxis: 0 },
  middlewares: [
    observePlacementChange({
      currentPlacement: dropdownCurrentPlacement,
      onChange: (newPlacement) => (dropdownCurrentPlacement.value = newPlacement),
    }),
  ],
  openControl: openControl.value,
  openChanged: (open: boolean) => {
    if (open) {
      emit('open')
    } else {
      closeMenu()
    }
  },
})

const search = ref('')
const searchActive = ref(false)
const searchRef = ref()
const searchIndex = ref(0)

const multiselectRef = ref()

const {
  itemRef: tooltipAnchorRef,
  tooltipMouseEnter,
  tooltipMouseLeave,
  cancelHoverTimer,
  tooltipRef,
  tooltipStyle,
  show: showTooltip,
} = useTooltipDelay()

const setToggleRef = (element: Element | ComponentPublicInstance | null) => {
  toggleRef.value = element
  if (element) {
    tooltipAnchorRef.value = element as Element
  }
}

const closeMenu = () => {
  // TODO -- should this call setMenuOpened(false) ?
  search.value = ''
  searchActive.value = false
  if (opened.value) {
    emit('close')
  }
}
useKeyListener(Keys.Escape, closeMenu)

const getLabel = (item: T): string => {
  if (typeof item === 'string') {
    return item
  } else {
    return (item[labelKey.value as keyof IMultiselectObj] ?? '') as string
  }
}

type ISearchArr = [T, number][]

const filteredOptions = computed(() => {
  let filtered = options.value ?? []
  if (searchActive.value && search.value) {
    const searchStr = search.value.toLowerCase()
    // Filter entries that don't include search term
    filtered = filtered.filter((opt) => getLabel(opt).toLowerCase().includes(searchStr))
    // Assign search precedence
    let searchArr: ISearchArr = filtered.map((opt) => {
      const label = getLabel(opt).toLowerCase()
      let searchVal = 0
      if (opt === searchStr) {
        searchVal = 2
      } else if (label.startsWith(searchStr)) {
        searchVal = 1
      }
      return [opt, searchVal]
    })
    // Sort by search precedence
    searchArr = searchArr.sort((a, b) => b[1] - a[1])
    filtered = searchArr.map((s) => s[0])
  }
  if (opened.value) {
    updateMenuPosition()
  }
  return filtered
})

const labels = computed(() => {
  return filteredOptions.value.map(getLabel)
})

const label = computed(() => {
  const opts = options.value
  if (!opts || opts[0] === undefined || typeof opts[0] === 'string') {
    return value.value ?? ''
  }
  return (
    (opts as IMultiselectObj[]).find(
      (opt) => opt[valueKey.value as keyof IMultiselectObj] === value.value,
    )?.[labelKey.value as keyof IMultiselectObj] ?? ''
  )
})

const updateSearch = (value: string) => {
  search.value = value
  searchIndex.value = Math.min(searchIndex.value, filteredOptions.value.length)
}

const handleKeydown = (e: KeyboardEvent) => {
  const optionsLen = filteredOptions.value.length
  if (e.key === Keys.Tab) {
    e.stopPropagation()
    e.preventDefault()
    searchEnter()
  } else if (e.key === Keys.Escape) {
    e.stopPropagation()
    e.preventDefault()
    closeMenu()
    setMenuOpened(false)
  } else if (e.key === Keys.ArrowUp) {
    searchIndex.value = (searchIndex.value + optionsLen - 1) % optionsLen
  } else if (e.key === Keys.ArrowDown) {
    searchIndex.value = (searchIndex.value + optionsLen + 1) % optionsLen
  }
  emit('keydown', e)
}

const searchEnter = () => {
  if (filteredOptions.value[0]) {
    select(searchIndex.value)
    closeMenu()
    setMenuOpened(false)
  } else if (allowAny.value) {
    emit('select', search.value as T)
    search.value = ''
    setMenuOpened(false)
  }
}

const toggleDropdown = async () => {
  if (disabled.value) {
    return
  }
  toggleMenu()
  cancelHoverTimer()
  if (searchable.value && opened.value) {
    searchActive.value = true
    searchIndex.value = 0
    await nextTick()
    searchRef.value?.inputRef.focus()
  } else {
    searchActive.value = false
  }
}

const select = (index: number) => {
  emit('select', filteredOptions.value[index])
  search.value = ''
}

const clear = () => {
  setMenuOpened(false)
  emit('select', undefined)
}

onMounted(() => {
  if (openInitial.value) {
    toggleDropdown()
  }
})

defineExpose({ multiselectRef, toggleDropdown })
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.ps-multiselect {
  width: 140px;
  position: relative;
  font-size: var(--ms-font-size);
  background: var(--ms-bg);
  cursor: pointer;
  border: var(--ms-border-width, 1px) solid var(--ms-border-color, #d1d5db);

  .ms-item.no-options {
    @mixin text 12px;
    padding: 6px 8px;
  }
}
.highlight {
  background-color: $blue-100;
}
.disabled {
  opacity: 0.6;
}
.search {
  height: 100%;
  :deep(.ps-input) {
    border: none;
    padding: 0;
    height: 100%;
    background: white;
  }
}
.label-text,
.placeholder {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.placeholder {
  color: var(--ms-placeholder-color);
}
.clear {
  margin-left: auto;
}
.clear-icon {
  display: flex;
  align-items: center;
  width: 13px;
  height: 13px;
}
.caret {
  font-size: var(--ms-font-size, 1rem);
  cursor: pointer;
  width: 0.625rem;
  height: 1.125rem;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
  background-color: var(--ms-caret-color, #999);
  margin: 0 4px 0 10px;
  mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 320 512' fill='currentColor' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z'/%3E%3C/svg%3E");
  pointer-events: none;
  position: relative;
  transform: rotate(0deg);
  transition: transform 0.25s;
  z-index: 10;
  &.opened {
    transform: rotate(180deg);
  }
}
.dropdown {
  position: absolute;
  max-height: 300px;
  overflow-y: auto;
  z-index: 999;
  left: 0;
  width: 100%;
  top: 100%;
  transition: transform 0.2s ease-in-out;
  transform-origin: v-bind(dropdownTransformOrigin);
  border: var(--ms-border-width, 1px) solid var(--ms-border-color, #d1d5db);
  background-color: white;
}

.multiselect-tooltip {
  @mixin tooltip;
  margin-top: 4px;
  max-width: 220px;
}

.slide-enter-from,
.slide-leave-to {
  transform: scaleY(0);
}
</style>
