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
        :options="contactTables.map((t) => t.name)"
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
import { setContactFormWalkthrough } from '@pubstudio/frontend/data-access-command'
import { PSButton } from '@pubstudio/frontend/ui-widgets'
import { ContactFormWalkthroughState } from '@pubstudio/shared/type-site'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { useContactForm } from '../lib/use-contact-form'

const { t } = useI18n()
const { contactTables, linkContactTable } = useContactForm()
const { editor } = useSiteSource()

const tableName = ref()

const select = (name: string | undefined) => {
  tableName.value = name
}

const goBack = () => {
  setContactFormWalkthrough(editor.value, ContactFormWalkthroughState.Init)
}

const linkTable = async () => {
  if (tableName.value) {
    await linkContactTable(tableName.value)
    setContactFormWalkthrough(editor.value, undefined)
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
.contact-actions {
  display: flex;
  margin-top: auto;
  justify-content: center;
}
.back-button {
  margin-left: 16px;
}
</style>
