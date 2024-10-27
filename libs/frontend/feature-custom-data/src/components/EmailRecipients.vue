<template>
  <div class="recipients-wrap">
    <div class="recipients">
      <div
        v-for="(recipient, index) in recipients"
        :key="recipient.key"
        class="recipient walkthrough-row"
      >
        <STInput
          :modelValue="recipient.email"
          :placeholder="t('email')"
          :isError="errorIndex === index"
          class="recipient-input"
          @update:modelValue="emit('updateRecipient', { index, email: $event })"
        />
        <Minus
          v-if="recipients.length > 1"
          class="recipient-remove"
          @click="emit('removeRecipient', index)"
        />
      </div>
    </div>
    <Plus
      v-if="recipients.length < 10"
      class="recipient-add"
      @click="emit('addRecipient')"
    />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'
import { Minus, Plus } from '@pubstudio/frontend/ui-widgets'
import {
  IRecipientListItem,
  IUpdateRecipientListItem,
} from '../lib/i-recipient-list-item'

const { t } = useI18n()

defineProps<{
  recipients: IRecipientListItem[]
  errorIndex: number | undefined
}>()
const emit = defineEmits<{
  (e: 'addRecipient'): void
  (e: 'updateRecipient', item: IUpdateRecipientListItem): void
  (e: 'removeRecipient', index: number): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.recipients {
  @mixin flex-row;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
}
.recipient {
  align-items: center;
  width: calc(50% - 8px);
}
.recipient-input {
  width: 100%;
  max-width: 200px;
  :deep(.st-input) {
    width: 100%;
  }
}
.recipient-add {
  @mixin size 22px;
  margin: 8px 0 0 20%;
  cursor: pointer;
  flex-shrink: 0;
}
.recipient-remove {
  @mixin size 24px;
  margin-left: 6px;
  cursor: pointer;
}
</style>
