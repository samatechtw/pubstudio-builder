<template>
  <div class="toolbar-item-dropdown">
    <div ref="toggleRef" :data-toggle-id="toggleId" class="active">
      <ToolbarItem
        :active="activeItem.active.value"
        :class="activeItem.class"
        @click="toggleMenu"
      >
        <component :is="activeItem.icon" />
      </ToolbarItem>
    </div>
    <div ref="menuRef" class="items" :class="{ opened }" :style="menuStyle">
      <div v-for="(item, index) in items" :key="index" class="item-wrap">
        <ToolbarItem
          :active="item.active.value"
          :tooltip="item.tooltip"
          :tooltipOptions="{ placement: 'right', offset: 4 }"
          :class="item.class"
          class="dropdown-item"
          @click="itemClick(item)"
        >
          <component :is="item.icon" />
        </ToolbarItem>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useDropdown } from '@pubstudio/frontend/util-dropdown'
import { Keys, useKeyListener } from '@pubstudio/frontend/util-key-listener'
import { useClickaway } from '@pubstudio/frontend/util-clickaway'
import { uidSingleton } from '@pubstudio/frontend/util-doc'
import { IToolbarDropdownItem } from './i-toolbar-dropdown'
import ToolbarItem from './ToolbarItem.vue'

const props = defineProps<{
  items: IToolbarDropdownItem[]
}>()
const { items } = toRefs(props)

const { menuRef, toggleRef, opened, menuStyle, setMenuOpened, toggleMenu } = useDropdown({
  clickawayIgnoreSelector: '.toolbar-item-dropdown',
  offset: { mainAxis: 0, crossAxis: 2 },
})

const closeMenu = () => setMenuOpened(false)

// toggleId prevents the menu from being opened and closed immediately when toggled
const toggleId = `toggle-${uidSingleton.next()}`
useClickaway(`div[data-toggle-id="${toggleId}"]`, closeMenu)
useKeyListener(Keys.Escape, closeMenu)

const activeItem = computed(() => {
  return items.value.find((item) => item.active.value) ?? items.value[0]
})

const itemClick = (item: IToolbarDropdownItem) => {
  closeMenu()
  item.click()
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.toolbar-item-dropdown {
  position: relative;
  z-index: 900;
}
.item-wrap {
  background-color: $color-toolbar-bg;
}
.items {
  @mixin flex-col;
  position: absolute;
  height: 0;
  transition: height 0.2s;
  z-index: 900;
  overflow: hidden;
  &.opened {
    height: v-bind(items.length * 36 + 'px');
    overflow-y: scroll;
  }
}
</style>
