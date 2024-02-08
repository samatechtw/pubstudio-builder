<template>
  <div class="size-unit-wrap">
    <div ref="toggleRef" class="size-unit" @click="toggleMenu">
      {{ currentUnit }}
    </div>
    <div
      ref="menuRef"
      class="ps-dropdown unit-dropdown"
      :class="{ 'ps-dropdown-opened': opened }"
      :style="menuStyle"
    >
      <div
        v-for="unit in CssSizeUnits"
        :key="unit"
        class="unit-option"
        @click.stop="selectUnit(unit)"
      >
        {{ unit }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CssSizeUnit, CssSizeUnits, ICssSize } from '@pubstudio/frontend/util-component'
import { useDropdown } from '@pubstudio/frontend/util-dropdown'
import { computed, toRefs } from 'vue'

const props = withDefaults(
  defineProps<{
    size: ICssSize
    clickawayIgnoreSelector?: string
  }>(),
  {
    clickawayIgnoreSelector: '.size-input-wrap',
  },
)
const { size, clickawayIgnoreSelector } = toRefs(props)

const emit = defineEmits<{
  (e: 'updateSize', size: ICssSize): void
}>()

const {
  toggleRef,
  menuRef,
  opened,
  menuStyle,
  setMenuOpened,
  toggleMenu: toggle,
} = useDropdown({
  clickawayIgnoreSelector: clickawayIgnoreSelector.value,
  offset: { crossAxis: 14, mainAxis: 0 },
})

// `auto` is a special case that gets displayed in the value input
const currentUnit = computed(() => {
  return size.value.unit === 'auto' ? '-' : size.value.unit
})

const selectUnit = (unit: CssSizeUnit) => {
  const prevUnit = size.value.unit
  const newSize = { ...size.value }
  if (prevUnit !== unit) {
    if (unit === 'auto' || unit === '-') {
      newSize.value = ''
    }
    newSize.unit = unit
    emit('updateSize', newSize)
  }
  setMenuOpened(false)
}

const toggleMenu = (e: MouseEvent | undefined) => {
  e?.stopPropagation()
  toggle()
}

defineExpose({ toggleMenu, opened })
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.size-unit-wrap {
  @mixin title 11px;
  display: flex;
  user-select: none;
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
  padding: 4px 6px 3px;
  &:hover {
    background-color: $border1;
  }
}

.unit-dropdown {
  width: auto;
  cursor: pointer;
}
</style>
