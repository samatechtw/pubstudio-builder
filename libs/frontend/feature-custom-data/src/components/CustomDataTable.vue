<template>
  <table class="custom-data-table">
    <thead>
      <tr>
        <th v-for="column in columns" :key="column.name" class="th">
          <div class="th-content">
            <span class="column-name"> {{ column.name }}</span>
            <InfoBubble
              class="column-type-info"
              placement="top"
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
  <template v-if="table">
    <Spinner v-if="loadingRows" class="rows-spinner" color="#2a17d6" :size="24" />
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
</template>

<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { InfoBubble, Spinner, TableNav } from '@pubstudio/frontend/ui-widgets'
import {
  ICustomTableColumn,
  ICustomTableViewModel,
} from '@pubstudio/shared/type-api-site-custom-data'
import { AdminTablePageSize } from '@pubstudio/frontend/util-fields'
import { useDataTable } from '../lib/use-data-table'
import { useCustomData } from '../lib/use-custom-data'

const { t } = useI18n()

const { page, total, pageSize, maxPage, from, to, setPageSize } = useDataTable()
const loadingRows = ref(false)
const rows = ref<Record<string, unknown>[]>([])

const props = defineProps<{
  table: ICustomTableViewModel | undefined
  siteId: string
}>()
const { table, siteId } = toRefs(props)

const { listRows: listRowsApi } = useCustomData(siteId)

const listRows = async (tableName: string) => {
  loadingRows.value = true
  const response = await listRowsApi({
    table_name: tableName,
    from: from.value,
    to: to.value,
  })
  if (response) {
    rows.value = response.results
    total.value = response.total
  }
  loadingRows.value = false
}

watch(table, async (newTable) => {
  if (newTable) {
    await listRows(newTable.name)
  }
})

const columns = computed(() => {
  if (!table.value) {
    return []
  }

  const record: Record<string, ICustomTableColumn> = table.value.columns
  return Object.entries(record).map(([name, column]) => ({
    name,
    dataType: column.data_type,
  }))
})

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

.th {
  @mixin text 15px;
  padding: 12px 24px;
  white-space: nowrap;
  color: $color-primary;
  background-color: $grey-200;
}
.th-content {
  @mixin flex-row;
  align-items: center;
}
.column-type-info {
  margin-left: 6px;
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

.custom-data-table {
  width: 100%;
  border-collapse: collapse;
}
.table-nav {
  margin-top: auto;
}
</style>
