<template>
  <div class="link-wrap">
    <div class="link-title">
      {{ t('custom_data.link') }}
    </div>
    <div class="link-text">
      {{ t('custom_data.link_text') }}
    </div>
    <div class="link-table">
      <PSMultiselect
        :value="tableId"
        :options="tables ?? []"
        :placeholder="t('custom_data.table_name')"
        valueKey="id"
        labelKey="name"
        class="link-dropdown"
        @select="select"
      />
    </div>
    <div class="contact-actions">
      <PSButton
        :text="t('confirm')"
        secondary
        :disabled="!tableId"
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
import { ICustomTableViewModel } from '@pubstudio/shared/type-api-site-custom-data'
import { setContactFormWalkthrough } from '@pubstudio/frontend/data-access-command'
import { PSButton, PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { ContactFormWalkthroughState } from '@pubstudio/shared/type-site'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { useContactForm } from '../lib/use-contact-form'

const { t } = useI18n()
const { tables, linkContactTable } = useContactForm()
const { editor } = useBuild()

const tableId = ref()

const select = (item: ICustomTableViewModel | undefined) => {
  tableId.value = item?.id
}

const goBack = () => {
  setContactFormWalkthrough(editor.value, ContactFormWalkthroughState.Init)
}

const linkTable = async () => {
  if (tableId.value) {
    await linkContactTable(tableId.value)
    setContactFormWalkthrough(editor.value, undefined)
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.link-wrap {
  @mixin flex-col;
  width: 100%;
  height: 100%;
  color: black;
}
.link-text {
  @mixin title-thin 18px;
  margin-top: 32px;
  text-align: center;
}
.link-title {
  @mixin title 22px;
  text-align: center;
}
.link-table {
  display: flex;
  margin-top: 24px;
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
