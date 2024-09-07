<template>
  <Modal :show="show" cls="import-table-modal" @cancel="emit('cancel')">
    <div class="modal-title">
      {{ t('import') }}
    </div>
    <div class="modal-text">
      {{ t('custom_data.import_text') }}
    </div>
    <div class="modal-text table-warning">
      <img src="@frontend-assets/icon/warning.png" class="warn" />
      <div>{{ t('custom_data.import_warn') }}</div>
    </div>
    <div class="import-wrap">
      <SimpleFileUpload
        id="table-import"
        class="table-import"
        accept="text/csv"
        @selectFile="selectFile"
      >
        <div class="csv-select">
          {{ t('custom_data.select') }}
        </div>
      </SimpleFileUpload>
      <div class="table-file">
        {{ fileName }}
      </div>
      <Minus class="remove" @click="clearFile" v-if="fileName" />
    </div>
    <div v-if="fileName" class="import-options">
      <Checkbox
        class="skip-error"
        :item="{
          label: t('custom_data.skip_error'),
          checked: skipError,
        }"
        @checked="skipError = $event"
      />
    </div>
    <div v-if="fileName" class="import-lines">
      <span>{{ t('custom_data.new_rows') }}</span>
      <span v-if="rowsImported !== undefined" class="new-rows">{{
        `${rowsImported} / ${rowData.length - 1}`
      }}</span>
      <span v-else class="new-rows">{{ rowData.length - 1 }}</span>
    </div>
    <ErrorMessage v-if="error" :error="error" class="import-error" />
    <ErrorMessage v-if="invalidRows" :error="invalidRows" class="import-error" />
    <div class="modal-buttons">
      <PSButton
        class="confirm-button"
        :text="t('confirm')"
        :animate="loading"
        @click="importTable"
      />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        :secondary="true"
        @click="emit('cancel')"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { format } from 'date-fns/format'
import { loadFile } from '@pubstudio/frontend/util-doc'
import {
  Checkbox,
  ErrorMessage,
  Minus,
  Modal,
  PSButton,
  SimpleFileUpload,
} from '@pubstudio/frontend/ui-widgets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { parseApiError, toApiError } from '@pubstudio/frontend/util-api'
import { useCustomDataApi } from '@pubstudio/frontend/data-access-api'
import { ICustomTableColumn } from '@pubstudio/shared/type-api-site-custom-data'

const i18n = useI18n()
const { t } = i18n
const { apiSite } = useSiteSource()

const props = defineProps<{
  tableName: string | undefined
  siteId: string
  columns: ICustomTableColumn[]
  show: boolean
}>()
const { tableName, columns, siteId, show } = toRefs(props)

const emit = defineEmits<{
  (e: 'imported', hasErrors: boolean): void
  (e: 'cancel'): void
}>()

const api = useCustomDataApi(siteId.value)
const fileName = ref()
const invalidRows = ref()
const error = ref()
const loading = ref(false)
const skipError = ref(false)
const rowsImported = ref()
const rowData = ref<string[][]>([])

watch(show, () => {
  clearFile()
})

const defaultFileName = (): string => {
  const date = format(new Date(), 'yyyyMMdd-HHmmss')
  return `${tableName.value}-${date}.csv`
}

const parseRow = (rowStr: string, splitChar: string): string[] => {
  if (splitChar === ',') {
    return rowStr.split(splitChar)
  } else {
    return rowStr.slice(1, rowStr.length - 1).split(splitChar)
  }
}

const selectFile = async (file: File) => {
  clearFile()
  const tableString = await loadFile(file)
  const columnNames = columns.value.map((c) => c.name)
  if (tableString) {
    let splitChar = ','
    const rows = tableString.split('\n')
    const row1 = rows[0]
    if (!row1) {
      error.value = t('errors.rows_missing')
      return
    }
    if (row1.charAt(0) === '"' && row1.charAt(row1.length - 1)) {
      splitChar = '","'
    }
    for (const colName of parseRow(row1, splitChar)) {
      if (!columnNames.includes(colName)) {
        error.value = `${t('errors.CustomDataInvalidColumn')}: ${colName}`
        return
      }
    }
    const newData: string[][] = []
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]
      // Skip blank lines
      if (!row) {
        continue
      }
      const newRow = parseRow(row, splitChar)
      if (newRow.length !== columnNames.length) {
        error.value = `${t('errors.row_length')} ${i + 1}`
        return
      }
      newData.push(newRow)
    }
    rowData.value = newData
    fileName.value = file.name
  }
}

const clearFile = () => {
  fileName.value = undefined
  invalidRows.value = undefined
  error.value = undefined
  rowsImported.value = undefined
}

const importTable = async () => {
  if (!apiSite || !tableName.value) {
    return
  }
  loading.value = true

  const columns = rowData.value[0]
  const rows = rowData.value.slice(1)
  let errorStr = ''
  rowsImported.value = 0
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    const rowMap = Object.fromEntries(columns.map((c, i) => [c, row[i]]))
    try {
      await api.addRow(apiSite, {
        table_name: tableName.value,
        row: rowMap,
      })
    } catch (e) {
      if (skipError.value) {
        if (errorStr) errorStr += ','
        errorStr += ` ${i + 1}`
      } else {
        error.value = parseApiError(i18n, toApiError(e))
        loading.value = false
        emit('imported', true)
        return
      }
    }
    rowsImported.value = i + 1
  }
  loading.value = false
  if (errorStr) {
    invalidRows.value = `${t('errors.invalid_rows')}${errorStr}`
  } else {
    emit('imported', false)
  }
}

watch(show, (newShow) => {
  if (newShow) {
    defaultFileName()
  }
})

onMounted(() => {
  fileName.value = defaultFileName()
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.import-table-modal {
  .modal-inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    max-width: 90%;
    width: 540px;
  }
  .modal-buttons {
    .confirm-button {
      margin-right: 8px;
      min-width: 94px;
    }
    .cancel-button {
      margin-left: 8px;
    }
  }
  .table-warning {
    display: flex;
    align-items: center;
  }
  .warn {
    @mixin size 24px;
    margin-right: 8px;
  }
  .import-wrap {
    display: flex;
    align-items: center;
    margin-top: 16px;
    font-size: 14px;
  }
  .table-import {
    margin-right: 8px;
  }
  .table-file {
    @mixin truncate;
    max-width: 240px;
  }
  .import-options {
    display: flex;
    margin-top: 12px;
    .checkbox {
      margin: 0 16px 0 0;
    }
  }
  .csv-select {
    font-size: 15px;
    padding: 6px 12px;
  }
  .import-lines {
    margin-top: 12px;
  }
  .new-rows {
    font-weight: bold;
    margin-left: 6px;
  }
  .remove {
    @mixin size 22px;
    margin-left: 8px;
    cursor: pointer;
  }
  .import-error .error {
    padding-top: 12px;
  }
  .modal-buttons {
    margin-top: 12px;
  }
}
</style>
