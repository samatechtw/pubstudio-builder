<template>
  <div class="contact-form-wrap recipients-wrap">
    <div class="contact-form-title">
      {{ t('custom_data.recipients') }}
    </div>
    <div class="contact-form-text">
      {{ t('custom_data.recipients_text') }}
    </div>
    <div class="recipients">
      <div
        v-for="(recipient, index) in recipients"
        :key="recipient[0]"
        class="recipient contact-form-row"
      >
        <PSInput
          :modelValue="recipient[1]"
          :placeholder="t('email')"
          :isError="errorIndex === index"
          class="recipient-input"
          @update:modelValue="recipient[1] = $event"
        />
        <Minus
          v-if="recipients.length > 1"
          class="recipient-remove"
          @click="removeRecipient(index)"
        />
      </div>
    </div>
    <Plus v-if="recipients.length < 10" class="recipient-add" @click="addRecipient" />
    <ErrorMessage :error="error && t(error)" class="create-table-error" />
    <div class="contact-form-actions">
      <PSButton
        :text="t('confirm')"
        secondary
        class="confirm-button"
        @click="createTable"
      />
      <PSButton
        v-if="contactTables.length"
        :text="t('back')"
        class="back-button"
        @click="goBack"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { setContactFormWalkthrough } from '@pubstudio/frontend/data-access-command'
import { ContactFormWalkthroughState } from '@pubstudio/shared/type-site'
import {
  ErrorMessage,
  Minus,
  PSButton,
  PSInput,
  Plus,
} from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { useContactForm } from '../lib/use-contact-form'

const {
  createContactTable,
  recipients,
  recipientKey,
  tableName,
  hasName,
  contactTables,
} = useContactForm()
const { editor } = useBuild()

const { t } = useI18n()

const error = ref()
const errorIndex = ref()

const removeRecipient = (index: number) => {
  recipients.value.splice(index, 1)
}

const addRecipient = () => {
  recipientKey.value += 1
  recipients.value.push([recipientKey.value, ''])
}

const goBack = () => {
  setContactFormWalkthrough(editor.value, ContactFormWalkthroughState.CreateTable)
}

const validateRecipients = (): boolean => {
  const len = recipients.value.length
  for (let i = 0; i < len; i += 1) {
    const recipient = recipients.value[i][1]
    if (recipient.length < 3 || recipient.length > 100 || !recipient?.includes('@')) {
      error.value = 'errors.invalid_email'
      errorIndex.value = i
      console.log('ERR', recipient)
      return false
    }
  }
  return true
}

const createTable = async () => {
  if (!validateRecipients()) {
    return
  }
  try {
    error.value = undefined
    await createContactTable(
      tableName.value,
      recipients.value.map((r) => r[1]),
      hasName.value,
    )
    setContactFormWalkthrough(editor.value, undefined)
  } catch (e) {
    error.value = e as string
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.recipients {
  @mixin flex-row;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  overflow-y: scroll;
}
.recipient {
  align-items: center;
  width: calc(50% - 8px);
}
.recipient-input {
  width: 100%;
  max-width: 200px;
  :deep(.ps-input) {
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
.back-button {
  margin-left: 16px;
}
</style>
