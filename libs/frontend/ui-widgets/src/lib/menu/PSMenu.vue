<template>
  <div :class="{ hide: !showMenu }" class="ps-menu">
    <div
      ref="toggleRef"
      class="ps-menu-toggle"
      :data-toggle-id="toggleId"
      @click="toggleMenu"
    >
      <slot name="toggle">
        <span class="ps-menu-toggle-text">
          {{ label }}
        </span>
        <span class="ps-menu-toggle-caret" :class="{ opened }" />
      </slot>
    </div>
    <DropdownMenuItems
      :ref="setMenuRef"
      :items="items"
      :opened="opened"
      :style="menuStyle"
      @closeMenu="closeMenu"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useDropdown } from '@pubstudio/frontend/util-dropdown'
import { useClickaway } from '@pubstudio/frontend/util-clickaway'
import { randChars } from '@pubstudio/shared/util-format'
import { Keys, useKeyListener } from '@pubstudio/frontend/util-key-listener'
import DropdownMenuItems from './DropdownMenuItems.vue'
import { IDropdownMenuItem } from '@pubstudio/frontend/type-ui-widgets'

const props = withDefaults(
  defineProps<{
    label?: string
    items?: IDropdownMenuItem[]
    clickawaySelector?: string
    hideWhenNoItems?: boolean
  }>(),
  {
    label: undefined,
    items: () => [],
    clickawaySelector: '.ps-menu',
    hideWhenNoItems: false,
  },
)
const { items, clickawaySelector, hideWhenNoItems } = toRefs(props)

const { setMenuRef, toggleRef, opened, menuStyle, setMenuOpened, toggleMenu } =
  useDropdown({
    clickawayIgnoreSelector: clickawaySelector.value,
    offset: { mainAxis: 4, crossAxis: -8 },
  })

const closeMenu = () => setMenuOpened(false)

// toggleId prevents the menu from being opened and closed immediately when toggled
const toggleId = randChars(8)
useClickaway(`div[data-toggle-id="${toggleId}"]`, closeMenu)
useKeyListener(Keys.Escape, closeMenu)

const showMenu = computed(() => {
  if (items.value.length) {
    return true
  }
  return !hideWhenNoItems.value
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.ps-menu {
  position: relative;
  color: black;
  &.hide {
    display: none;
  }
}
.ps-menu-toggle {
  @mixin flex-row;
  padding-right: 8px;
  align-items: center;
  cursor: pointer;
  border-radius: 4px;
}
.ps-menu-toggle-text {
  @mixin text 16px;
  @mixin truncate;
  display: inline-block;
  margin-right: 16px;
}
.ps-menu-toggle-caret {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid $grey-700;
  transform: rotate(0deg);
  transition: transform 0.25s;
  &.opened {
    transform: rotate(180deg);
  }
}
</style>
