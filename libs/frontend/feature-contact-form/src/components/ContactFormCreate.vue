<template>
  <div class="create-wrap">
    <div class="create-title">
      {{ t('custom_data.create') }}
    </div>
    <div class="create-text">
      {{ t('custom_data.create_text') }}
    </div>
    <div class="create-table">
      <div class="table-name-row row">
        <PSInput
          v-model="tableName"
          :label="t('custom_data.table_name')"
          class="name-input"
        />
      </div>
      <div class="name-toggle-row row">
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
    <div class="contact-actions">
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
import { Checkbox, ErrorMessage, PSButton, PSInput } from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { useContactForm } from '../lib/use-contact-form'

const { createContactTable, contactTables } = useContactForm()
const { editor } = useBuild()

const { t } = useI18n()

const tableName = ref('')
const hasName = ref(false)
const error = ref()

const goBack = () => {
  setContactFormWalkthrough(editor.value, ContactFormWalkthroughState.Init)
}

const createTable = async () => {
  try {
    error.value = undefined
    await createContactTable(tableName.value, hasName.value)
    setContactFormWalkthrough(editor.value, undefined)
  } catch (e) {
    error.value = e as string
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.create-wrap {
  @mixin flex-col;
  width: 100%;
  height: 100%;
  color: black;
  justify-content: space-between;
}
.create-text {
  @mixin title-thin 18px;
  margin-top: 24px;
  text-align: center;
}
.create-title {
  @mixin title 22px;
  text-align: center;
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
.row {
  display: flex;
  margin-top: 8px;
  width: 100%;
  justify-content: center;
}
.contact-actions {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
.back-button {
  margin-left: 16px;
}
</style>
