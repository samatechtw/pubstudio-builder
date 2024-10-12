<template>
  <Modal
    :show="show"
    cls="edit-actions-modal"
    :cancelByClickingOutside="false"
    escapeEvent="keyup"
    @cancel="emit('cancel')"
  >
    <div class="modal-title">
      {{ t('custom_data.edit_actions') }}
    </div>
    <div class="modal-text">
      {{ t('custom_data.actions_text') }}
    </div>
    <div class="edit-actions">
      <EditActionRow
        v-for="(event, index) in newEvents"
        :label="`${t('action')} ${index + 1}`"
        :triggers="triggers"
        :eventTypes="eventTypes"
        :action="event"
        @removeAction="removeAction(index)"
      />
      <div class="add-action" @click="addAction">
        {{ t('custom_data.add_action') }}
      </div>
    </div>
    <ErrorMessage v-if="error" :error="error" />
    <div class="edit-actions-buttons">
      <PSButton :text="t('save')" :animate="saving" class="save-button" @click="save" />
      <PSButton
        :text="t('cancel')"
        :secondary="true"
        class="cancel-button"
        @click="emit('cancel')"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ErrorMessage, Modal, PSButton } from '@pubstudio/frontend/ui-widgets'
import {
  EmailRowOptions,
  ICustomTableEvent,
  ICustomTableViewModel,
} from '@pubstudio/shared/type-api-site-custom-data'
import { useI18n } from 'petite-vue-i18n'
import { ref, toRefs, watch } from 'vue'
import { useDataTable } from '../lib/use-data-table'
import EditActionRow from './EditActionRow.vue'
import { checkRecipientsError } from '../lib/check-recipients-error'

const props = defineProps<{
  show: boolean
  siteId: string
  table: ICustomTableViewModel | undefined
}>()
const { table, show, siteId } = toRefs(props)
const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const { t } = useI18n()

const newEvents = ref<ICustomTableEvent[]>([])
const error = ref()
const saving = ref(false)

const selectEntry = (key: string) => {
  return {
    label: t(`custom_data.${key}`),
    value: key,
  }
}

const triggers = [selectEntry('AddRow'), selectEntry('UpdateRow')]
const eventTypes = [selectEntry('EmailRow')]

watch(table, (newTable) => {
  if (newTable) {
    newEvents.value = [...newTable.events]
  }
})

const addAction = () => {
  newEvents.value.push({
    event_type: 'EmailRow',
    trigger: 'AddRow',
    options: { recipients: [] },
  })
}

const removeAction = (index: number) => {
  newEvents.value.splice(index, 1)
}

const validateEvents = (): boolean => {
  if (newEvents.value.length > 10) {
    error.value = t('errors.CustomDataMaxEvents')
    return false
  }
  for (const event of newEvents.value) {
    const options = event.options as EmailRowOptions
    if (event.event_type === 'EmailRow' && options && 'recipients' in options) {
      const err = checkRecipientsError(options.recipients)
      if (err) {
        error.value = t('errors.CustomDataInvalidEmail')
        return false
      }
    }
  }
  return true
}

const save = async () => {
  if (table.value) {
    if (!validateEvents()) {
      return
    }
    const { errorKey, updateTableEvents } = useDataTable(siteId)
    saving.value = true
    await updateTableEvents(table.value.name, newEvents.value)
    saving.value = false
    if (errorKey.value) {
      error.value = t(errorKey.value)
    } else {
      emit('cancel')
    }
  }
}
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.edit-actions-modal {
  .modal-inner {
    max-height: 95%;
    overflow-y: scroll;
    max-width: 90%;
    width: 480px;
  }
}

.edit-actions {
  @mixin flex-col;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
}
.add-action {
  @mixin text-medium 14px;
  color: $color-primary;
  margin-top: 8px;
  cursor: pointer;
}
.edit-actions-buttons {
  margin-top: 24px;
}
.save-button {
  margin-right: 24px;
}
</style>
