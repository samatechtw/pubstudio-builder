<template>
  <Modal :show="show" cls="delete-table-modal" @cancel="emit('cancel')">
    <div class="modal-title">
      {{ t('custom_data.delete_table') }}
    </div>
    <div class="modal-text" v-html="t('custom_data.delete_text', { tableName })" />
    <PSInput
      v-model="confirmTableName"
      name="delete"
      class="delete-tablename"
      :placeholder="tableName"
      @keydown.enter="deleteTable"
    />
    <ErrorMessage v-if="exportError || error" :error="exportError || error" />
    <div class="modal-buttons">
      <PSButton
        class="confirm-button"
        size="medium"
        :animate="loading"
        :text="t('confirm')"
        @click="deleteTable"
      />
      <PSButton
        class="export-button"
        size="medium"
        :animate="exporting"
        :text="t('export')"
        @click="exportTable"
      />
      <PSButton
        class="cancel-button"
        size="medium"
        :text="t('cancel')"
        :secondary="true"
        @click="emit('cancel')"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ErrorMessage, Modal, PSButton, PSInput } from '@pubstudio/frontend/ui-widgets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { ICustomTableColumn } from '@pubstudio/shared/type-api-site-custom-data'
import { parseApiError, toApiError } from '@pubstudio/frontend/util-api'
import { useCustomDataApi } from '@pubstudio/frontend/data-access-api'
import { defaultFileName, useExportTable } from '../lib/use-export-table'

const i18n = useI18n()
const { t } = i18n
const { apiSite } = useSiteSource()

const props = defineProps<{
  tableName: string | undefined
  columns: ICustomTableColumn[]
  siteId: string
  show: boolean
}>()
const { columns, tableName, siteId, show } = toRefs(props)
const {
  exportTable: exportTableApi,
  exportError,
  exporting,
} = useExportTable(siteId.value)

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'deleted'): void
}>()

const api = useCustomDataApi(siteId.value)
const loading = ref(false)
const error = ref()
const confirmTableName = ref('')

const deleteTable = async () => {
  if (!apiSite || !tableName.value) {
    return
  }
  if (confirmTableName.value !== tableName.value) {
    error.value = t('errors.table_confirm')
    return
  }
  loading.value = true
  try {
    await api.deleteTable(apiSite, { table_name: tableName.value })
  } catch (e) {
    error.value = parseApiError(i18n, toApiError(e))
  }
  loading.value = false
  emit('deleted')
}

const exportTable = async () => {
  const fileName = defaultFileName(defaultFileName(tableName.value))
  await exportTableApi(fileName, tableName.value, columns.value)
}

watch(show, () => {
  confirmTableName.value = ''
  error.value = undefined
  exportError.value = undefined
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.delete-table-modal {
  .modal-text span {
    font-weight: 700;
  }
  .delete-tablename {
    margin-top: 16px;
  }
  .confirm-button {
    background-color: $color-red;
  }
  .modal-buttons {
    justify-content: space-between;
    width: 100%;
  }
  .confirm-button {
    margin-right: 8px;
    min-width: 94px;
  }
  .cancel-button {
    margin-left: 8px;
  }
  .modal-text {
    margin: 24px 0;
  }
}
</style>
