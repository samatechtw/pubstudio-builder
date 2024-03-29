<template>
  <Modal
    cls="custom-data-modal"
    :cancelByClickingOutside="false"
    escapeEvent="keyup"
    @cancel="cancel"
  >
    <div class="modal-title">
      {{ t('build.custom_data') }}
    </div>
    <div class="modal-text">
      {{ t('build.custom_data_subtitle') }}
    </div>
    <div class="table-select-wrap">
      <div class="label">
        {{ t('build.table') }}
      </div>
      <PSMultiselect
        :value="selectedTable"
        class="table-select"
        :options="tableOptions"
        :placeholder="t('build.table')"
        @select="selectTable($event?.label)"
        @click.stop
      />
    </div>
    <div class="table-wrap" :class="{ 'table-selected': !!selectedTable }">
      <div v-if="!selectedTable" class="table-placeholder">
        {{ t('build.table_placeholder') }}
      </div>
      <table v-else class="custom-data-table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.name" class="th">
              <div class="th-content">
                <span class="column-name"> {{ column.name }}</span>
                <InfoBubble
                  class="column-type-info"
                  :message="column.dataType.toString()"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="index">
            <td v-for="column in columns" :key="column.name" class="td">
              {{ row[column.name] }}
            </td>
          </tr>
        </tbody>
      </table>
      <template v-if="selectedTable">
        <Spinner v-if="loadingRows" class="rows-spinner" color="#2a17d6" :size="24" />
        <div v-else-if="!rows.length" class="no-data">
          {{ t('table.no_data') }}
        </div>
        <DataTableNav
          :page="page"
          :maxPage="maxPage"
          :pageSize="pageSize"
          :offset="from"
          :total="total"
          @setPage="updatePage"
          @setPageSize="updatePageSize"
        />
      </template>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'petite-vue-i18n'
import {
  InfoBubble,
  Modal,
  PSMultiselect,
  Spinner,
  DataTableNav,
} from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { setSelectedTable } from '@pubstudio/frontend/data-access-command'
import {
  ITableColumn,
  ICustomDataInfoViewModel,
} from '@pubstudio/shared/type-api-site-custom-data'
import { useCustomData } from '../lib/use-custom-data'
import { useDataTable } from '../lib/use-data-table'
import { AdminTablePageSize } from '@pubstudio/frontend/util-fields'

const { t } = useI18n()
const route = useRoute()

const { editor } = useBuild()

const selectedTable = computed(() => editor.value?.selectedTable)

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const { listTables: listTablesApi, listRows: listRowsApi } = useCustomData()

const loadingTables = ref(false)
const tables = ref<ICustomDataInfoViewModel[]>([])

const loadingRows = ref(false)
const rows = ref<Record<string, unknown>[]>([])

const { page, total, pageSize, maxPage, from, to, setPageSize } = useDataTable()

const cancel = () => {
  setSelectedTable(editor.value, undefined)
  emit('cancel')
}

const tableOptions = computed(() =>
  tables.value.map((table) => ({
    label: table.name,
    value: table.name,
  })),
)

const columns = computed(() => {
  if (!selectedTable.value) {
    return []
  }

  const table = tables.value.find((table) => table.name === selectedTable.value)
  if (!table) {
    return []
  }

  const record: Record<string, ITableColumn> = JSON.parse(table.columns)
  return Object.entries(record).map(([name, column]) => ({
    name,
    dataType: column.data_type,
  }))
})

const siteId = computed(() => {
  if (route.name === 'BuildScratch') {
    return 'scratch'
  }
  return route.params.siteId?.toString() ?? ''
})

const listTables = async () => {
  loadingTables.value = true
  const response = await listTablesApi(siteId.value, {})
  if (response) {
    tables.value = response.results
  }
  loadingTables.value = false
}

const selectTable = async (tableName: string | undefined) => {
  setSelectedTable(editor.value, tableName)
  if (tableName) {
    await listRows(tableName)
  }
}

const listRows = async (tableName: string) => {
  loadingRows.value = true
  const response = await listRowsApi(siteId.value, {
    table_name: tableName,
    from: from.value,
    to: to.value,
  })
  if (response) {
    rows.value = response.results.map((row) => JSON.parse(row))
    total.value = response.total
  }
  loadingRows.value = false
}

const updatePage = async (value: number) => {
  page.value = value
  if (selectedTable.value) {
    await listRows(selectedTable.value)
  }
}

const updatePageSize = async (value: AdminTablePageSize) => {
  setPageSize(value)
  if (selectedTable.value) {
    await listRows(selectedTable.value)
  }
}

onMounted(async () => {
  await listTables()
  if (selectedTable.value) {
    await listRows(selectedTable.value)
  }
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.custom-data-modal {
  .modal-inner {
    width: 90%;
    height: 90%;
    overflow-y: auto;
  }
  .table-select-wrap {
    @mixin flex-row;
    margin-top: 16px;
    align-items: center;
    .label {
      @mixin text-medium 16px;
    }
    .table-select {
      margin-left: 16px;
    }
  }
  .table-wrap {
    margin-top: 16px;
    .table-placeholder {
      @mixin h4;
      color: $color-disabled;
    }
    .custom-data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .th {
      @mixin text 15px;
      padding: 12px 24px;
      white-space: nowrap;
      color: $color-primary;
      background-color: $grey-200;
      .th-content {
        @mixin flex-row;
        align-items: center;
        .column-type-info {
          margin-left: 6px;
        }
      }
    }
    .td {
      @mixin body-small;
      padding: 12px 24px;
      border-top: 1px solid $grey-300;
      background-color: white;
    }
    .rows-spinner {
      @mixin flex-center;
      padding: 48px 0;
    }
    .no-data {
      @mixin h4;
      padding: 32px 0;
      color: $color-disabled;
      text-align: center;
    }
    &.table-selected {
      border: 1px solid $grey-100;
    }
  }
}
</style>
