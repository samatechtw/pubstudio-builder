<template>
  <table class="custom-data-table">
    <CustomDataTableHead
      :columns="columns"
      :allSelected="allSelected"
      :someSelected="someSelected"
      :disableSelect="disableSelect"
      @addRow="showAddRow"
      @deleteRows="deleteRows"
      @editColumn="confirmEditColumn"
      @selectAll="selectAll"
    />
    <tbody>
      <EditTableRow
        v-if="newRow"
        :row="newRow"
        :columns="columns"
        class="new-row"
        @confirm="confirmAddRow"
        @cancel="cancelNewRow"
      />
      <template v-for="(row, index) in rows" :key="row.id">
        <EditTableRow
          v-if="row.id === editRow?.id"
          :row="row"
          :columns="columns"
          @confirm="confirmUpdateRow($event)"
          @cancel="cancelEditRow"
        />
        <ViewTableRow
          v-else
          :row="row"
          :columns="columns"
          :disableSelect="disableSelect"
          :selected="selectedRows.has(index)"
          @select="selectRow(index)"
          @edit="showEditRow(row)"
        />
      </template>
    </tbody>
  </table>
  <template v-if="table">
    <div v-if="loading" class="spinner-wrap">
      <Spinner class="rows-spinner" color="#2a17d6" :size="24" />
    </div>
    <div v-else-if="!rows.length" class="no-data">
      {{ t('table.no_data') }}
    </div>
    <TableNav
      :page="page"
      :maxPage="maxPage"
      :pageSize="pageSize"
      :offset="from"
      :total="total"
      class="table-nav"
      @setPage="updatePage"
      @setPageSize="updatePageSize"
    />
  </template>
  <ConfirmModal
    :show="showConfirmDelete"
    :title="t('build.confirm_delete')"
    :text="t('custom_data.delete_rows')"
    @confirm="confirmDeleteRows"
    @cancel="showConfirmDelete = false"
  />
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ConfirmModal, Spinner, TableNav } from '@pubstudio/frontend/ui-widgets'
import {
  ICustomTableColumn,
  ICustomTableRow,
  ICustomTableViewModel,
} from '@pubstudio/shared/type-api-site-custom-data'
import { AdminTablePageSize } from '@pubstudio/frontend/util-fields'
import { useDataTable } from '../lib/use-data-table'
import { defaultCustomRow } from '../lib/default-custom-row'
import EditTableRow from './EditTableRow.vue'
import ViewTableRow from './ViewTableRow.vue'
import CustomDataTableHead from './CustomDataTableHead.vue'
import { IEditColumnName } from '../lib/i-edit-column'

const { t } = useI18n()

const props = defineProps<{
  table: ICustomTableViewModel | undefined
  columns: ICustomTableColumn[]
  siteId: string
}>()
const { table, siteId, columns } = toRefs(props)

const {
  page,
  total,
  pageSize,
  maxPage,
  from,
  errorKey,
  loading,
  rows,
  editRow,
  newRow,
  listRows,
  addRow,
  updateRow,
  deleteRow,
  modifyColumn,
  setPageSize,
} = useDataTable(siteId)
const allSelected = ref(false)
const showConfirmDelete = ref(false)
const selectedRows = reactive<Set<number>>(new Set())

watch(table, async (newTable) => {
  if (newTable) {
    await listRows(newTable.name)
  }
})

onMounted(async () => {
  if (table.value?.name) {
    await listRows(table.value.name)
  }
})

const disableSelect = computed(() => {
  return !!newRow.value || !!editRow.value
})

const someSelected = computed(() => {
  return selectedRows.size > 0
})

const selectRow = (rowIndex: number) => {
  if (selectedRows.has(rowIndex)) {
    selectedRows.delete(rowIndex)
  } else {
    selectedRows.add(rowIndex)
  }
}

const deleteRows = async () => {
  showConfirmDelete.value = true
}

const selectAll = () => {
  allSelected.value = !allSelected.value
  if (allSelected.value) {
    for (let i = 0; i < rows.value.length; i += 1) {
      selectedRows.add(i)
    }
  } else {
    selectedRows.clear()
  }
}

const showAddRow = () => {
  newRow.value = defaultCustomRow(columns.value)
}

const confirmDeleteRows = async () => {
  if (table.value) {
    showConfirmDelete.value = false
    // Sort row indexes in descending order so removing them doesn't cause issues
    const rowIndexes = Array.from(selectedRows).sort((a, b) => b - a)
    for (const rowIndex of rowIndexes) {
      await deleteRow(table.value.name, rowIndex)
    }
    selectedRows.clear()
    allSelected.value = false
  }
}

const showEditRow = (row: ICustomTableRow) => {
  editRow.value = { ...row }
}
const cancelEditRow = () => {
  editRow.value = undefined
  errorKey.value = undefined
}

const confirmAddRow = async (row: ICustomTableRow) => {
  if (table.value) {
    await addRow(table.value.name, row)
  }
}
const cancelNewRow = () => {
  newRow.value = undefined
  errorKey.value = undefined
}

const confirmUpdateRow = async (row: ICustomTableRow) => {
  if (table.value) {
    await updateRow(table.value.name, row)
  }
}

const confirmEditColumn = async (info: IEditColumnName) => {
  if (table.value) {
    await modifyColumn(table.value.name, info)
    for (const row of rows.value) {
      row[info.newName] = row[info.oldName]
      delete row[info.oldName]
    }
    table.value.columns[info.newName] = {
      ...table.value.columns[info.oldName],
      name: info.newName,
    }
    delete table.value.columns[info.oldName]
  }
}

const updatePage = async (value: number) => {
  page.value = value
  if (table.value) {
    await listRows(table.value.name)
  }
}

const updatePageSize = async (value: AdminTablePageSize) => {
  setPageSize(value)
  if (table.value) {
    await listRows(table.value.name)
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.custom-data-table {
  width: 100%;
  border-collapse: collapse;
}
.action {
  @mixin flex-center;
  padding: 12px 8px;
  width: 60px;
  cursor: pointer;
}
tbody tr:last-child {
  border-bottom: 1px solid $grey-300;
}
.spinner-wrap {
  @mixin overlay;
  @mixin flex-center;
  background-color: rgba(0, 0, 0, 0.15);
}
.rows-spinner {
  @mixin flex-center;
}
.no-data {
  @mixin h4;
  padding: 32px 0;
  color: $color-disabled;
  text-align: center;
}
.table-nav {
  margin-top: auto;
}
tr:not(:first-child) {
  border-top: 1px solid $grey-300;
}
</style>
