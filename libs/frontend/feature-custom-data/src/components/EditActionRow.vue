<template>
  <div class="edit-action">
    <div class="action-head">
      <div class="action-label">
        {{ label }}
      </div>
      <div class="delete-action" @click="emit('removeAction')">
        {{ t('delete') }}
      </div>
    </div>
    <div class="action-items">
      <STMultiselect
        :value="action.trigger"
        :options="triggers"
        :clearable="false"
        class="action-trigger"
        @select="selectTrigger($event?.value)"
      />
      <STMultiselect
        :value="action.event_type"
        :options="eventTypes"
        :clearable="false"
        class="action-type"
        @select="selectType($event?.value)"
      />
    </div>
    <div class="email-options">
      <div class="recipients-label">
        {{ t('recipients') }}
      </div>
      <EmailRecipients
        v-if="action.event_type === 'EmailRow'"
        :recipients="recipients"
        :errorIndex="undefined"
        @addRecipient="addRecipient"
        @updateRecipient="updateRecipient($event)"
        @removeRecipient="removeRecipient"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { STMultiselect } from '@samatech/vue-components'
import {
  EmailRowOptions,
  ICustomTableEvent,
  ICustomTableEventTrigger,
  ICustomTableEventType,
} from '@pubstudio/shared/type-api-site-custom-data'
import {
  IRecipientListItem,
  IUpdateRecipientListItem,
} from '../lib/i-recipient-list-item'
import EmailRecipients from './EmailRecipients.vue'
import { onMounted, ref } from 'vue'

interface IMultiselectOption {
  label: string
  value: string
}

const { t } = useI18n()

const { action } = defineProps<{
  action: ICustomTableEvent
  label: string
  triggers: IMultiselectOption[]
  eventTypes: IMultiselectOption[]
}>()

const emit = defineEmits<{
  (e: 'removeAction'): void
}>()

// Key for email recipient list rendering
let recipientKey = 0
// Keep a separate copy of recipients to avoid list rerender
const recipients = ref<IRecipientListItem[]>([])

const makeRecipients = (event: ICustomTableEvent): IRecipientListItem[] => {
  const options = event.options as EmailRowOptions
  if (options && 'recipients' in options) {
    return options.recipients.map((r) => {
      const recip = { key: recipientKey, email: r }
      recipientKey += 1
      return recip
    })
  }
  return []
}

const addRecipient = () => {
  const options = action.options as EmailRowOptions
  if (options && 'recipients' in options) {
    options.recipients.push('')
    recipients.value.push({ key: recipientKey, email: '' })
    recipientKey += 1
  }
}

const removeRecipient = (index: number) => {
  const options = action.options as EmailRowOptions
  if (options && 'recipients' in options) {
    options.recipients.splice(index, 1)
    recipients.value.splice(index, 1)
  }
}

const updateRecipient = (item: IUpdateRecipientListItem) => {
  const options = action.options as EmailRowOptions
  if (options && 'recipients' in options) {
    options.recipients[item.index] = item.email
    recipients.value[item.index].email = item.email
  }
}

const selectTrigger = (trigger: string | undefined) => {
  if (trigger) {
    action.trigger = trigger as ICustomTableEventTrigger
  }
}

const selectType = (eventType: string | undefined) => {
  if (eventType) {
    action.event_type = eventType as ICustomTableEventType
  }
}

onMounted(() => {
  recipients.value = makeRecipients(action)
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.edit-action {
  width: 100%;
  padding: 12px 0;
  border-bottom: 1px solid $grey-300;
}
.action-items {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 0;
}
.st-multiselect.action-trigger {
  width: 120px;
  margin-right: 16px;
}
.st-multiselect.action-type {
  width: 130px;
}
.action-head {
  display: flex;
  align-items: center;
}
.action-label {
  @mixin h6;
  font-size: 16px;
}
.recipients-label {
  @mixin title-bold 13px;
  margin-top: 4px;
}
.delete-action {
  @mixin text-medium 14px;
  color: $color-red;
  cursor: pointer;
  margin-left: auto;
}
.remove-action {
  @mixin size 24px;
  margin-left: auto;
  cursor: pointer;
}
</style>
