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
        <STInput
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
        :text="t('confirm')"
        secondary
        class="confirm-button"
        @click="createTable"
      />
      <PSButton
        v-if="mailingListTables.length"
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
import { STInput } from '@samatech/vue-components'
import { setMailingListWalkthrough } from '@pubstudio/frontend/data-access-command'
import { MailingListWalkthroughState } from '@pubstudio/shared/type-site'
import { Checkbox, ErrorMessage, PSButton } from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { useMailingListForm } from '../lib/use-mailing-list-form'

const { mailingListTables, createMailingListTable, hasName, tableName } =
  useMailingListForm()
const { editor } = useBuild()

const { t } = useI18n()

const error = ref()

const goBack = () => {
  setMailingListWalkthrough(editor.value, MailingListWalkthroughState.Init)
}

const createTable = async () => {
  try {
    error.value = undefined
    await createMailingListTable(tableName.value, hasName.value)
    setMailingListWalkthrough(editor.value, undefined)
  } catch (e) {
    error.value = e as string
  }
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
  :deep(.st-input) {
    width: 100%;
  }
}
.back-button {
  margin-left: 16px;
}
</style>
