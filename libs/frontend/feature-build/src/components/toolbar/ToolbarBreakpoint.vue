<template>
  <div class="builder-breakpoint-wrap">
    <ToolbarItem :ref="setToggleRef" :active="opened" @click="toggleMenu">
      <ToolbarBreakpointIcon :breakpoint="activeBreakpoint" />
    </ToolbarItem>
    <div
      ref="menuRef"
      class="ps-dropdown builder-breakpoint-dropdown"
      :class="{ 'ps-dropdown-opened': opened }"
      :style="menuStyle"
    >
      <ToolbarBreakpointOption
        v-for="breakpoint in breakpoints"
        :key="breakpoint.id"
        :breakpoint="breakpoint"
      />
      <!-- Edit breakpoints -->
      <div
        ref="itemRef"
        class="ps-dropdown-item edit-breakpoint-wrap"
        @mouseenter="tooltipMouseEnter"
        @mouseleave="tooltipMouseLeave"
        @click="openEditBreakpointMenu"
      >
        <Edit class="edit-icon" />
        <div
          v-if="showEditTooltip"
          ref="tooltipRef"
          class="edit-breakpoint-tooltip"
          :style="tooltipStyle"
        >
          {{ t('style.toolbar.edit_breakpoint') }}
        </div>
      </div>
    </div>
    <EditBreakpointModal
      :show="showEditModal"
      @save="saveBreakpoints"
      @cancel="showEditModal = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ComponentPublicInstance, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useDropdown } from '@pubstudio/frontend/util-dropdown'
import { Edit } from '@pubstudio/frontend/ui-widgets'
import { useTooltipDelay } from '@pubstudio/frontend/util-tooltip'
import { ToolbarItem } from '@pubstudio/frontend/ui-widgets'
import { useBreakpoint } from '@pubstudio/frontend/feature-breakpoint'
import { IBreakpoint } from '@pubstudio/shared/type-site'
import ToolbarBreakpointIcon from './ToolbarBreakpointIcon.vue'
import ToolbarBreakpointOption from './ToolbarBreakpointOption.vue'
import EditBreakpointModal from './EditBreakpointModal.vue'
import { useBuild } from '../../lib/use-build'
import { useEditBreakpoints } from '../../lib/use-edit-breakpoints'

const { t } = useI18n()

const { editor, setBreakpoint } = useBuild()
const { breakpoints, activeBreakpoint } = useBreakpoint(editor)

const { initBreakpoints } = useEditBreakpoints()
const showEditModal = ref(false)

const { toggleRef, menuRef, opened, menuStyle, toggleMenu } = useDropdown({
  clickawayIgnoreSelector: '.builder-breakpoint-wrap',
  placement: 'bottom',
})

const setToggleRef = (el: ComponentPublicInstance | null | Element) => {
  if (el && '$el' in el) {
    toggleRef.value = el?.$el
  }
}

const {
  itemRef,
  tooltipMouseEnter,
  tooltipMouseLeave,
  cancelHoverTimer,
  tooltipRef,
  tooltipStyle,
  show: showEditTooltip,
} = useTooltipDelay()

const openEditBreakpointMenu = () => {
  // Close breakpoint dropdown menu
  toggleMenu()
  cancelHoverTimer()

  // Open edit breakpoints modal
  initBreakpoints()
  showEditModal.value = true
}

const saveBreakpoints = (newBreakpoints: IBreakpoint[]) => {
  const breakpointRecord = Object.fromEntries(
    newBreakpoints.map((breakpoint) => [breakpoint.id, breakpoint]),
  )
  setBreakpoint(breakpointRecord)
  showEditModal.value = false
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.ps-dropdown-opened {
  @mixin flex-row;
  width: auto;
}

.edit-breakpoint-wrap {
  @mixin flex-center;
  @mixin size 40px;
  position: relative;
  .edit-icon {
    @mixin size 20px;
    flex-shrink: 0;
  }
  .edit-breakpoint-tooltip {
    @mixin tooltip;
    margin-top: 4px;
    padding: 12px;
  }
}
</style>
