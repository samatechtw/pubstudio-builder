<template>
  <div class="dropdown-menu-items" :class="{ opened }">
    <template v-for="(item, index) in items" :key="index">
      <component
        :is="itemTag(item)"
        class="ps-dropdown-item"
        :class="{ [item.class ?? '']: item.class }"
        v-bind="itemProps(item)"
        :disabled="item.loading"
        @click="itemClick($event, item)"
      >
        <Spinner v-if="item.loading" class="dropdown-menu-item-spinner" color="#868692" />
        <template v-else>
          {{ computeItemLabel(item) }}
        </template>
      </component>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { IDropdownMenuItem } from '@pubstudio/frontend/type-ui-widgets'
import Spinner from '../Spinner.vue'

const { t } = useI18n()

defineProps<{
  opened: boolean
  items: IDropdownMenuItem[]
}>()

const emit = defineEmits<{
  (e: 'itemClick', item: IDropdownMenuItem): void
  (e: 'closeMenu'): void
}>()

const itemTag = (item: IDropdownMenuItem) => {
  const { to } = item
  if (to) {
    return typeof to === 'string' ? 'a' : 'router-link'
  } else {
    return 'div'
  }
}

const itemProps = (item: IDropdownMenuItem) => {
  const { to, linkTarget } = item
  if (!to) {
    // Not a link
    return {}
  } else {
    // Is a link
    if (typeof to === 'string') {
      return {
        href: to,
        target: linkTarget,
      }
    } else {
      return {
        to,
        target: linkTarget,
      }
    }
  }
}

const itemClick = (e: MouseEvent, item: IDropdownMenuItem) => {
  e.stopPropagation()
  if (!item.loading) {
    item.click?.()
    emit('itemClick', item)
    emit('closeMenu')
  }
}

const computeItemLabel = (item: IDropdownMenuItem) => {
  if (item.labelKey) {
    return t(item.labelKey)
  } else {
    return item.label
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.dropdown-menu-items {
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25));
  position: absolute;
  min-width: 184px;
  height: 0;
  max-height: 192px;
  overflow: hidden;
  transition: height 0.2s;
  z-index: 1;
  &.opened {
    height: v-bind(items.length * 48 + 'px');
    overflow-y: auto;
  }
  .ps-dropdown-item {
    @mixin title-medium 15px;
    background-color: white;
    .dropdown-menu-item-spinner {
      margin-left: 4px;
    }
    &:not(:first-child) {
      border-top: 1px solid $grey-300;
    }
    &[disabled='true'] {
      color: $color-disabled;
      cursor: default;
    }
    &:not([disabled='true']):hover {
      background-color: $grey-300;
    }
  }
}
</style>
