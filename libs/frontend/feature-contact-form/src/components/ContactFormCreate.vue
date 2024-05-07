<template>
  <div class="create-wrap walkthrough-wrap">
    <div class="walkthrough-title">
      {{ t('custom_data.create') }}
    </div>
    <div class="walkthrough-text">
      {{ t('custom_data.create_text') }}
    </div>
    <div class="create-table">
      <div class="walkthrough-row">
        <PSInput
          v-model="tableName"
          :label="t('custom_data.table_name')"
          class="name-input"
        />
      </div>
      <div class="walkthrough-row">
        <Checkbox
          :item="{
            label: t('custom_data.show_name'),
            checked: hasName,
          }"
          class="contact-name-toggle"
          @checked="hasName = $event"
        />
      </div>
    </div>
    <ErrorMessage :error="error && t(error)" class="create-table-error" />
    <div class="walkthrough-actions">
      <PSButton
        :text="t('next')"
        secondary
        class="confirm-button"
        @click="goRecipients"
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
import { Checkbox, ErrorMessage, PSButton, PSInput } from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { useContactForm } from '../lib/use-contact-form'

const { contactTables, hasName, tableName } = useContactForm()
const { editor } = useBuild()

const { t } = useI18n()

const error = ref()

const goBack = () => {
  setContactFormWalkthrough(editor.value, ContactFormWalkthroughState.Init)
}

const goRecipients = async () => {
  setContactFormWalkthrough(editor.value, ContactFormWalkthroughState.Recipients)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.create-wrap {
  justify-content: space-between;
}
.create-table {
  @mixin flex-col;
  margin-top: 24px;
  align-items: center;
}
.name-input {
  width: 100%;
  max-width: 200px;
  :deep(.ps-input) {
    width: 100%;
  }
}
.back-button {
  margin-left: 16px;
}
</style>
