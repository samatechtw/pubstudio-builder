<template>
  <div class="breakpoint-wrap">
    <ToolbarBreakpointOption
      v-for="breakpoint in breakpoints"
      :key="breakpoint.id"
      :breakpoint="breakpoint"
    />
    <ToolbarItem :tooltip="t('toolbar.edit_breakpoint')" @click="openEditBreakpointMenu">
      <Edit class="edit-breakpoints" />
    </ToolbarItem>
    <EditBreakpointModal
      :show="showEditModal"
      @save="saveBreakpoints"
      @cancel="setShowEditModal(false)"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { Edit } from '@pubstudio/frontend/ui-widgets'
import { ToolbarItem } from '@pubstudio/frontend/ui-widgets'
import { useBreakpoint } from '@pubstudio/frontend/feature-breakpoint'
import { useBuild, useEditBreakpoints } from '@pubstudio/frontend/feature-build'
import { IAddBreakpoint } from '@pubstudio/shared/type-command-data'
import ToolbarBreakpointOption from './ToolbarBreakpointOption.vue'
import EditBreakpointModal from './EditBreakpointModal.vue'

const { t } = useI18n()

const { setBreakpoint } = useBuild()
const { breakpoints } = useBreakpoint()

const { initBreakpoints } = useEditBreakpoints()
const showEditModal = ref(false)

const openEditBreakpointMenu = () => {
  // Open edit breakpoints modal
  initBreakpoints()
  setShowEditModal(true)
}

const saveBreakpoints = (newBreakpoints: IAddBreakpoint[]) => {
  // TODO -- only save modified breakpoints
  setBreakpoint(newBreakpoints)
  setShowEditModal(false)
}

const setShowEditModal = (show: boolean) => {
  showEditModal.value = show
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.ps-dropdown-opened {
  @mixin flex-row;
  width: auto;
}
.breakpoint-wrap {
  display: flex;
}

.edit-breakpoints {
  @mixin size 20px;
}
</style>
