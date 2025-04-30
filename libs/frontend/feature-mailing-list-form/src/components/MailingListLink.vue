<template>
  <div class="walkthrough-wrap">
    <div class="link-title">
      {{ t('custom_data.link') }}
    </div>
    <div class="walkthrough-text">
      {{ t('custom_data.link_text') }}
    </div>
    <div class="link-table">
      <STMultiselect
        :value="tableName"
        :options="mailingListTables.map((t) => t.name)"
        :placeholder="t('custom_data.table_name')"
        class="link-dropdown"
        @select="select"
      />
    </div>
    <div class="walkthrough-actions">
      <PSButton
        :text="t('confirm')"
        secondary
        :disabled="!tableName"
        class="confirm-button"
        @click="linkTable"
      />
      <PSButton :text="t('back')" class="back-button" @click="goBack" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STMultiselect } from '@samatech/vue-components'
import { setMailingListWalkthrough } from '@pubstudio/frontend/data-access-command'
import { PSButton } from '@pubstudio/frontend/ui-widgets'
import { MailingListWalkthroughState } from '@pubstudio/shared/type-site'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { useMailingListForm } from '../lib/use-mailing-list-form'

const { t } = useI18n()
const { mailingListTables, linkMailingListTable } = useMailingListForm()
const { editor } = useSiteSource()

const tableName = ref()

const select = (name: string | undefined) => {
  tableName.value = name
}

const goBack = () => {
  setMailingListWalkthrough(editor.value, MailingListWalkthroughState.Init)
}

const linkTable = async () => {
  if (tableName.value) {
    await linkMailingListTable(tableName.value)
    setMailingListWalkthrough(editor.value, undefined)
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.link-title {
  @mixin title 22px;
  text-align: center;
}
.link-table {
  display: flex;
  margin-top: 48px;
  justify-content: center;
}
.link-dropdown {
  width: 100%;
  max-width: 200px;
  :deep(.dropdown) {
    max-height: 200px;
  }
}
.back-button {
  margin-left: 16px;
}
</style>
