<template>
  <Modal
    cls="edit-breakpoint-modal"
    :cancelByClickingOutside="false"
    @cancel="emit('cancel')"
  >
    <div class="modal-title">
      {{ t('style.toolbar.edit_breakpoint') }}
      <Plus class="breakpoint-add" @click="showAddBreakpointModal = true" />
    </div>
    <div class="modal-content">
      <div class="row label-row">
        <div class="col name-col">
          {{ t('name') }}
        </div>
        <div class="col min-width-col">
          {{ t('build.breakpoint.min_width') }}
        </div>
        <div class="col max-width-col">
          {{ t('build.breakpoint.max_width') }}
        </div>
      </div>
      <EditBreakpointRow
        v-for="(breakpoint, i) in breakpoints"
        :key="breakpoint.id"
        :breakpoint="breakpoint"
        :errorKey="errorKeys[i]"
        @update:minWidth="updateMinWidth(i, $event)"
        @update:maxWidth="updateMaxWidth(i, $event)"
      />
    </div>
    <div class="edit-breakpoint-actions">
      <PSButton class="save-button" :text="t('save')" @click="save" />
      <PSButton class="cancel-button" :text="t('cancel')" @click="emit('cancel')" />
    </div>
    <ConfirmModal
      :show="showAddBreakpointModal"
      :title="t('build.breakpoint.add')"
      :text="t('build.breakpoint.add_text')"
      @confirm="confirmAddBreakpoint"
      @cancel="showAddBreakpointModal = false"
    />
  </Modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ConfirmModal, Modal, Plus, PSButton } from '@pubstudio/frontend/ui-widgets'
import EditBreakpointRow from './EditBreakpointRow.vue'
import { IBreakpoint } from '@pubstudio/shared/type-site'
import { useEditBreakpoints } from '@pubstudio/frontend/feature-build'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'save', newBreakpoints: IBreakpoint[]): void
  (e: 'cancel'): void
}>()

const showAddBreakpointModal = ref(false)

const { breakpoints, errorKeys, addBreakpoint, updateMinWidth, updateMaxWidth } =
  useEditBreakpoints()

const save = () => {
  const hasError = errorKeys.value.some((key) => !!key)
  if (!hasError) {
    emit('save', breakpoints.value)
  }
}

const confirmAddBreakpoint = () => {
  addBreakpoint()
  showAddBreakpointModal.value = false
}
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.modal-title {
  display: flex;
  align-items: center;
}

.breakpoint-add {
  @mixin size 24px;
  margin-left: 12px;
  cursor: pointer;
}

.modal-content {
  margin-top: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.row {
  display: flex;
  align-items: center;
  .col {
    @mixin title-semibold 15px;
    width: 33%;
    padding: 0 4px;
  }
}

.label-row {
  margin-bottom: 4px;
}

.breakpoint-row {
  & + & {
    margin-top: 12px;
  }
}

.edit-breakpoint-actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  .cancel-button {
    margin-left: 24px;
  }
}
</style>
