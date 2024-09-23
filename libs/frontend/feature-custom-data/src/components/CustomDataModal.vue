<template>
  <Modal
    v-if="show"
    :show="show"
    cls="custom-data-modal"
    :cancelByClickingOutside="false"
    escapeEvent="keyup"
    @cancel="cancel"
  >
    <div class="modal-title">
      {{ t('custom_data.title') }}
    </div>
    <div class="modal-text">
      {{ t('custom_data.subtitle') }}
    </div>
    <div class="table-select-wrap">
      <PSMultiselect
        :value="selectedTableName"
        class="table-select"
        :options="tableOptions"
        :placeholder="t('build.table')"
        @select="selectTable($event?.label)"
        @click.stop
      />
      <PSButton
        :text="t('custom_data.create')"
        size="small"
        class="create-table"
        @click="showNewTable = true"
      />
      <ErrorMessage v-if="errorKey" :error="t(errorKey)" class="table-error" />
      <PSMenu v-if="selectedTableName" :items="tableActions" class="table-actions">
        <template #toggle>
          <DotsIcon color="#000" />
        </template>
      </PSMenu>
    </div>
    <div class="table-wrap" :class="{ 'table-selected': !!selectedTableName }">
      <div v-if="!selectedTableName" class="table-placeholder">
        {{ tables?.length ? t('build.table_select') : t('build.table_placeholder') }}
      </div>
      <CustomDataTable
        v-else
        :table="selectedTable"
        :columns="selectedColumns"
        :siteId="siteId"
      />
    </div>
    <AddColumnModal
      :show="showNewColumn"
      :columns="selectedColumns"
      @create="columnCreated"
      @cancel="showNewColumn = false"
    />
    <CreateTableModal
      :show="showNewTable"
      @created="tableCreated"
      @cancel="showNewTable = false"
    />
    <ExportTableModal
      :show="showExport"
      :siteId="siteId"
      :columns="selectedColumns"
      :tableName="selectedTableName"
      @cancel="showExport = false"
    />
    <DeleteTableModal
      :show="showDeleteTable"
      :siteId="siteId"
      :columns="selectedColumns"
      :tableName="selectedTableName"
      @cancel="showDeleteTable = false"
      @deleted="deleteComplete"
    />
    <ImportTableModal
      :show="showImport"
      :siteId="siteId"
      :columns="selectedColumns"
      :tableName="selectedTableName"
      @cancel="showImport = false"
      @imported="importComplete"
    />
  </Modal>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  DotsIcon,
  ErrorMessage,
  Modal,
  PSButton,
  PSMenu,
  PSMultiselect,
} from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { setSelectedTable } from '@pubstudio/frontend/data-access-command'
import {
  ICustomTableColumn,
  ICustomTableViewModel,
} from '@pubstudio/shared/type-api-site-custom-data'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { useCustomDataApi } from '@pubstudio/frontend/data-access-api'
import CustomDataTable from './CustomDataTable.vue'
import AddColumnModal from './AddColumnModal.vue'
import CreateTableModal from './CreateTableModal.vue'
import { useDataTable } from '../lib/use-data-table'
import ExportTableModal from './ExportTableModal.vue'
import ImportTableModal from './ImportTableModal.vue'
import { useRoute } from '@pubstudio/frontend/util-router'
import DeleteTableModal from './DeleteTableModal.vue'

const { t } = useI18n()
const route = useRoute()
const { editor } = useBuild()
const { apiSite } = useSiteSource()

const loadingTables = ref(false)
const tables = ref<ICustomTableViewModel[]>([])
const showNewColumn = ref(false)
const showNewTable = ref(false)
const showExport = ref(false)
const showDeleteTable = ref(false)
const showImport = ref(false)

const selectedTableName = computed(() => editor.value?.selectedTable)
const selectedTable = computed(() => {
  if (!selectedTableName.value) {
    return undefined
  }
  return tables.value.find((t) => t.name === selectedTableName.value)
})

const selectedColumns = computed<ICustomTableColumn[]>(() => {
  if (!selectedTable.value) {
    return []
  }

  const record: Record<string, ICustomTableColumn> = selectedTable.value.columns
  return Object.values(record)
})

const props = defineProps<{
  show: boolean
}>()
const { show } = toRefs(props)
const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const siteId = computed(() => {
  if (route.value?.name === 'BuildScratch') {
    return 'scratch'
  }
  return route.value?.params.siteId?.toString() ?? ''
})
const api = useCustomDataApi(siteId.value)
const { errorKey, addColumn } = useDataTable(siteId)

const cancel = () => {
  setSelectedTable(editor.value, undefined)
  emit('cancel')
}

const tableOptions = computed(
  () =>
    tables.value?.map((table) => ({
      label: table.name,
      value: table.name,
    })) ?? [],
)

const listTables = async () => {
  if (!apiSite) {
    return
  }
  loadingTables.value = true
  try {
    const response = await api.listTables(apiSite, {})
    tables.value = response.results
  } catch (e) {
    console.log('List custom data tables error: ', e)
  }
  loadingTables.value = false
}

const tableActions = [
  {
    label: t('custom_data.add_column'),
    class: 'add-column',
    click: () => (showNewColumn.value = true),
  },
  {
    label: t('import'),
    class: 'table-import',
    click: () => (showImport.value = true),
  },
  {
    label: t('export'),
    class: 'table-export',
    click: () => (showExport.value = true),
  },
  {
    label: t('custom_data.delete_table'),
    class: 'delete-table',
    click: () => (showDeleteTable.value = true),
  },
]

const selectTable = async (tableName: string | undefined) => {
  setSelectedTable(editor.value, tableName)
}

const importComplete = async (hasErrors: boolean) => {
  if (!hasErrors) {
    showImport.value = false
  }
  await listTables()
}

const deleteComplete = async () => {
  showDeleteTable.value = false
  selectTable(undefined)
  await listTables()
}

const columnCreated = async (info: ICustomTableColumn) => {
  if (selectedTable.value) {
    await addColumn(selectedTable.value.name, info)
    showNewColumn.value = false
    await listTables()
  }
}

const tableCreated = async (tableName: string) => {
  showNewTable.value = false
  await listTables()
  selectTable(tableName)
}

watch(show, async () => {
  await listTables()
})

onMounted(async () => {
  if (show.value) {
    await listTables()
  }
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.custom-data-modal {
  .modal-inner {
    @mixin flex-col;
    width: 90%;
    height: 90%;
    overflow-y: auto;
  }
  .table-select-wrap {
    @mixin flex-row;
    margin-top: 16px;
    align-items: center;
  }
  .table-placeholder {
    @mixin h5;
    color: $color-disabled;
    margin-top: 24px;
  }
  .create-table {
    margin: 0 16px;
    flex-shrink: 0;
  }
  .table-error {
    flex: 1 1 0;
    .error {
      padding: 0;
    }
  }
  .table-wrap {
    @mixin flex-col;
    justify-content: space-between;
    flex-grow: 1;
    margin-top: 16px;
    position: relative;
    &.table-selected {
      border: 1px solid $grey-300;
    }
  }
  .table-actions {
    margin-left: auto;
  }
}
</style>
