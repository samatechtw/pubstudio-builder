<template>
  <Modal :show="show" cls="export-table-modal" @cancel="emit('cancel')">
    <div class="modal-title">
      {{ t('custom_data.export_title') }}
    </div>
    <div class="modal-text">
      {{ t('custom_data.export_text') }}
    </div>
    <PSInput
      v-model="fileName"
      name="export"
      class="export-filename"
      :placeholder="t('enter')"
      @keydown.enter="exportTable"
    />
    <div class="modal-buttons">
      <PSButton class="confirm-button" :text="t('confirm')" @click="exportTable" />
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
import { saveFile } from '@pubstudio/frontend/util-doc'
import { Modal, PSButton, PSInput } from '@pubstudio/frontend/ui-widgets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { ICustomTableColumn } from '@pubstudio/shared/type-api-site-custom-data'
import { parseApiError, toApiError } from '@pubstudio/frontend/util-api'
import { useCustomDataApi } from '@pubstudio/frontend/data-access-api'

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

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const api = useCustomDataApi(siteId.value)
const fileName = ref('')
const loading = ref(false)
const error = ref()

const defaultFileName = (): string => {
  const date = format(new Date(), 'yyyyMMdd-HHmmss')
  return `${tableName.value}-${date}.csv`
}

const exportTable = async () => {
  if (!apiSite || !tableName.value) {
    return
  }
  loading.value = true
  let tableString = ''
  try {
    const response = await api.listRows(apiSite, {
      table_name: tableName.value,
      from: 1,
      to: 100000,
    })
    const columnNames = columns.value.map((c) => c.name)
    tableString = `"${columnNames.join('","')}"\n`
    for (const row of response.results) {
      const rowString = columnNames.map((col) => row[col]).join('","')
      tableString += `"${rowString}"\n`
    }
  } catch (e) {
    error.value = parseApiError(i18n, toApiError(e))
  }
  loading.value = false

  saveFile(fileName.value, tableString, 'csv')
  emit('cancel')
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

.export-table-modal {
  .export-filename {
    margin-top: 16px;
  }
  .modal-buttons {
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
  .export-types {
    @mixin flex-col;
    @mixin title-normal 14px;
    margin-top: 4px;
    color: black;
  }
  .export-type {
    margin-top: 6px;
    cursor: pointer;
  }
}
</style>
