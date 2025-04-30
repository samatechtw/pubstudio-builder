<template>
  <div class="walkthrough-wrap recipients-wrap">
    <div class="walkthrough-title">
      {{ t('custom_data.recipients') }}
    </div>
    <div class="walkthrough-text">
      {{ t('custom_data.recipients_text') }}
    </div>
    <EmailRecipients
      :recipients="recipients"
      :errorIndex="errorIndex"
      class="contact-recipients"
      @addRecipient="addRecipient"
      @updateRecipient="recipients[$event.index].email = $event.email"
      @removeRecipient="removeRecipient"
    />
    <ErrorMessage :error="error && t(error)" class="create-table-error" />
    <div class="walkthrough-actions">
      <PSButton
        :text="t('confirm')"
        secondary
        class="confirm-button"
        @click="createTable"
      />
      <PSButton :text="t('back')" class="back-button" @click="goBack" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { setContactFormWalkthrough } from '@pubstudio/frontend/data-access-command'
import { ContactFormWalkthroughState } from '@pubstudio/shared/type-site'
import { ErrorMessage, PSButton } from '@pubstudio/frontend/ui-widgets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { useContactForm } from '../lib/use-contact-form'
import {
  checkRecipientsError,
  EmailRecipients,
} from '@pubstudio/frontend/feature-custom-data'

const { createContactTable, recipients, recipientKey, tableName, hasName } =
  useContactForm()
const { editor } = useSiteSource()

const { t } = useI18n()

const error = ref()
const errorIndex = ref()

const removeRecipient = (index: number) => {
  recipients.value.splice(index, 1)
}

const addRecipient = () => {
  recipientKey.value += 1
  recipients.value.push({ key: recipientKey.value, email: '' })
}

const goBack = () => {
  setContactFormWalkthrough(editor.value, ContactFormWalkthroughState.CreateTable)
}

const createTable = async () => {
  const recipientsError = checkRecipientsError(recipients.value.map((r) => r.email))
  if (recipientsError) {
    error.value = recipientsError.errorKey
    errorIndex.value = recipients.value
    return
  }
  try {
    error.value = undefined
    await createContactTable(
      tableName.value,
      recipients.value.map((r) => r.email),
      hasName.value,
    )
    setContactFormWalkthrough(editor.value, undefined)
  } catch (e) {
    error.value = e as string
  }
}
</script>

<style lang="postcss" scoped>
.back-button {
  margin-left: 16px;
}
.contact-recipients {
  overflow-y: scroll;
}
</style>
