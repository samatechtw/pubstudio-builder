<template>
  <Modal
    :show="show"
    cls="create-table-modal"
    :cancelByClickingOutside="false"
    escapeEvent="keyup"
    @cancel="emit('cancel')"
  >
    <div class="modal-title">
      {{ t('custom_data.create') }}
    </div>
    <div class="modal-text">
      {{ t('custom_data.create_text2') }}
    </div>
    <div class="column-label">
      {{ t('custom_data.table_name') }}
    </div>
    <STInput v-model="tableName" :placeholder="t('name')" class="table-name" />
    <div class="labels-wrap">
      <div class="column-label">
        {{ t('custom_data.columns') }}
      </div>
      <div class="column-label">
        {{ t('custom_data.validators') }}
      </div>
    </div>
    <ColumnForm
      v-for="(info, index) in columns"
      :showDelete="columns.length > 1"
      :info="info"
      class="column-info"
      @remove="removeColumn(index)"
    />
    <div class="new-col-wrap">
      <Plus class="new-col" @click="addColumn" />
    </div>
    <ErrorMessage v-if="error" :error="error" />
    <div class="create-table-actions">
      <PSButton :text="t('ok')" class="table-button" @click="confirm" />
      <PSButton
        :text="t('cancel')"
        :secondary="true"
        class="cancel-button"
        @click="emit('cancel')"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'
import { ErrorMessage, Modal, Plus, PSButton } from '@pubstudio/frontend/ui-widgets'
import { makeColumnInfo } from '@pubstudio/frontend/util-custom-data'
import { ICreateTableApiRequest } from '@pubstudio/shared/type-api-site-custom-data'
import { useCustomDataApi } from '@pubstudio/frontend/data-access-api'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { parseApiError, toApiError } from '@pubstudio/frontend/util-api'
import { IEditTableColumn } from '../lib/i-edit-column'
import ColumnForm from './ColumnForm.vue'
import { verifyColumn } from '../lib/verify-column'

const i18n = useI18n()
const { t } = i18n
const { apiSite, apiSiteId } = useSiteSource()

const props = defineProps<{
  show: boolean
}>()
const { show } = toRefs(props)
const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'created', tableName: string): void
}>()

const api = useCustomDataApi(apiSiteId.value as string)
const columns = ref<IEditTableColumn[]>([])
const tableName = ref('')
const error = ref()

const newCol = (): IEditTableColumn => ({
  name: '',
  default: '',
  data_type: 'TEXT',
  validators: {},
})

watch(show, (newShow) => {
  if (newShow) {
    columns.value = [newCol()]
    tableName.value = ''
  }
})

const confirm = async () => {
  error.value = undefined
  if (tableName.value.length < 2 || tableName.value.length > 100) {
    error.value = t('errors.table_name')
    return
  }
  for (const info of columns.value) {
    const colError = verifyColumn(info)
    if (colError) {
      error.value = t(colError)
      return
    }
  }
  const tablePayload: ICreateTableApiRequest = {
    table_name: tableName.value,
    columns: {},
    events: [],
  }
  for (const column of columns.value) {
    tablePayload.columns[column.name] = makeColumnInfo({
      name: column.name,
      default: column.default,
      validation_rules: Object.values(column.validators).map((validator) => ({
        rule_type: validator.rule_type,
        parameter: validator.parameter ? parseInt(validator.parameter) : undefined,
      })),
    })
  }
  try {
    await api.createTable(apiSite, tablePayload)
    emit('created', tableName.value)
  } catch (e) {
    console.log('Failed to create table:', e)
    error.value = parseApiError(i18n, toApiError(e))
  }
}

const addColumn = () => {
  columns.value.push(newCol())
}

const removeColumn = (index: number) => {
  columns.value.splice(index, 1)
}
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.create-table-modal {
  .modal-inner {
    max-width: 90%;
    max-height: 95%;
    overflow-y: auto;
    width: 480px;
  }
  .labels-wrap {
    display: flex;
  }
  .column-label {
    @mixin title-bold 14px;
    width: 50%;
    margin-top: 12px;
  }
  .table-name {
    margin-top: 6px;
  }
  .new-col-wrap {
    text-align: center;
    margin-top: 6px;
  }
  .new-col {
    @mixin size 24px;
    cursor: pointer;
  }
  .create-table-actions {
    margin-top: 24px;
  }
  .table-button {
    margin-right: 16px;
  }
}
</style>
