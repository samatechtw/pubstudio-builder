<template>
  <div
    class="ps-multiselect"
    :class="{ disabled }"
    :data-toggle-id="dataToggleId"
    @click="toggleDropdown"
  >
    <div
      :ref="setToggleRef"
      class="label"
      @mouseenter="tooltipMouseEnter"
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
        @keydown.enter.stop="searchEnter"
        @click.stop="toggleDropdown"
      />
      <div v-else-if="label" class="label-text">
        {{ label }}
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
          @click="select(index)"
        >
          {{ l }}
        </div>
        <div
          v-if="!labels.length"
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
        :style="tooltipStyle"
      >
        {{ tooltip }}
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup generic="T extends IMultiselectOption">
import { ComponentPublicInstance, computed, nextTick, onMounted, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
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
    // TODO -- implement multiple selection via array
    value: string | undefined
    labelKey?: string
    valueKey?: string
    placeholder?: string
    toggleId?: string
    tooltip?: string
    emptyText?: string
    openInitial?: boolean
    openControl?: () => boolean
  }>(),
  {
    placeholder: undefined,
    openControl: undefined,
    toggleId: undefined,
    labelKey: 'label',
    valueKey: 'value',
    caret: true,
    options: () => [] as T[],
    searchable: false,
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
} = toRefs(props)

const emit = defineEmits<{
  (e: 'select', value: T | undefined): void
  (e: 'selectEmpty'): void
  (e: 'open'): void
  (e: 'close'): void
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
  layoutShift: false,
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
}

const searchEnter = () => {
  if (filteredOptions.value[0]) {
    select(0)
    closeMenu()
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
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

$padding-x: 8px;

.ps-multiselect {
  width: 140px;
  position: relative;
  font-size: var(--ms-font-size);
  background: var(--ms-bg);
  cursor: pointer;
  border: var(--ms-border-width, 1px) solid var(--ms-border-color, #d1d5db);
}
.disabled {
  opacity: 0.6;
}
.label {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 4px $padding-x;
  align-items: center;
  justify-content: space-between;
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
}
.ms-item {
  width: 100%;
  padding: 7px $padding-x 5px;
  background: var(--ms-dropdown-bg);
  &:hover {
    background: var(--ms-option-bg-pointed);
  }
  &:last-child {
    padding-bottom: 8px;
  }
}

.multiselect-tooltip {
  @mixin tooltip;
  margin-top: 4px;
}

.slide-enter-from,
.slide-leave-to {
  transform: scaleY(0);
}
</style>
