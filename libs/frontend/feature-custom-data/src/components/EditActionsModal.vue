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
      <div v-for="(event, index) in newEvents" class="edit-action">
        <PSMultiselect
          :value="event.trigger"
          :options="triggers"
          :clearable="false"
          class="action-trigger"
          @select="selectTrigger(event, $event?.value)"
        />
        <PSMultiselect
          :value="event.event_type"
          :options="eventTypes"
          :clearable="false"
          class="action-type"
          @select="selectType(event, $event?.value)"
        />
        <Minus class="remove-action" @click="removeAction(index)" />
      </div>
      <Plus class="add-action" @click="addAction" />
    </div>
    <ErrorMessage v-if="error" :error="error" />
    <div class="edit-actions-buttons">
      <PSButton :text="t('save')" class="save-button" @click="save" />
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
import {
  ErrorMessage,
  Minus,
  Modal,
  Plus,
  PSButton,
  PSMultiselect,
} from '@pubstudio/frontend/ui-widgets'
import {
  ICustomTableEvent,
  ICustomTableEventTrigger,
  ICustomTableEventType,
} from '@pubstudio/shared/type-api-site-custom-data'
import { useI18n } from 'petite-vue-i18n'
import { ref, toRefs, watch } from 'vue'
import { useDataTable } from '../lib/use-data-table'
import { useCustomDataApi } from '@pubstudio/frontend/data-access-api'

const props = defineProps<{
  show: boolean
  events: ICustomTableEvent[]
  siteId: string
  tableName: string
}>()
const { events, show, siteId, tableName } = toRefs(props)
const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const { t } = useI18n()

const newEvents = ref<ICustomTableEvent[]>([])
const error = ref()

const selectEntry = (key: string) => {
  return {
    label: t(`custom_data.${key}`),
    value: key,
  }
}

const triggers = [selectEntry('AddRow'), selectEntry('UpdateRow')]
const eventTypes = [selectEntry('EmailRow')]

watch(
  () => events,
  () => {
    newEvents.value = [...events.value]
  },
)

const selectTrigger = (event: ICustomTableEvent, trigger: string | undefined) => {
  if (trigger) {
    event.trigger = trigger as ICustomTableEventTrigger
  }
}

const selectType = (event: ICustomTableEvent, eventType: string | undefined) => {
  if (eventType) {
    event.event_type = eventType as ICustomTableEventType
  }
}

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

const save = () => {
  const api = useCustomDataApi(siteId.value)
  const { errorKey, addColumn } = useDataTable(siteId)
}
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.edit-actions {
  @mixin flex-col;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
}
.edit-action {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid $grey-300;
}
.ps-multiselect.action-trigger {
  width: 120px;
  margin-right: 16px;
}
.ps-multiselect.action-type {
  width: 130px;
}
.add-action {
  @mixin size 28px;
  margin-top: 8px;
  cursor: pointer;
}
.remove-action {
  @mixin size 24px;
  margin-left: auto;
  cursor: pointer;
}

.modal-inner {
  max-width: 90%;
  width: 480px;
}
.edit-actions-buttons {
  margin-top: 24px;
}
.save-button {
  margin-right: 24px;
}
</style>
