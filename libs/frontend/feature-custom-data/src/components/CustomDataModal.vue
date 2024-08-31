<template>
  <Modal
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
    </div>
    <div class="table-wrap" :class="{ 'table-selected': !!selectedTableName }">
      <div v-if="!selectedTableName" class="table-placeholder">
        {{ tables?.length ? t('build.table_select') : t('build.table_placeholder') }}
      </div>
      <CustomDataTable :table="selectedTable" :siteId="siteId" v-else />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'petite-vue-i18n'
import { Modal, PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { setSelectedTable } from '@pubstudio/frontend/data-access-command'
import { ICustomTableViewModel } from '@pubstudio/shared/type-api-site-custom-data'
import { useCustomData } from '../lib/use-custom-data'
import CustomDataTable from './CustomDataTable.vue'

const { t } = useI18n()
const route = useRoute()
const { editor } = useBuild()

const loadingTables = ref(false)
const tables = ref<ICustomTableViewModel[]>([])

const selectedTableName = computed(() => editor.value?.selectedTable)
const selectedTable = computed(() => {
  if (!selectedTableName.value) {
    return undefined
  }
  return tables.value.find((t) => t.name === selectedTableName.value)
})

const props = defineProps<{
  show: boolean
}>()
const { show } = toRefs(props)
const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const siteId = computed(() => {
  if (route.name === 'BuildScratch') {
    return 'scratch'
  }
  return route.params.siteId?.toString() ?? ''
})

const { listTables: listTablesApi } = useCustomData(siteId)

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
  loadingTables.value = true
  const response = await listTablesApi({})
  if (response) {
    tables.value = response.results
  }
  loadingTables.value = false
}

const selectTable = async (tableName: string | undefined) => {
  setSelectedTable(editor.value, tableName)
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
  .table-wrap {
    @mixin flex-col;
    justify-content: space-between;
    flex-grow: 1;
    margin-top: 16px;
    &.table-selected {
      border: 1px solid $grey-100;
    }
  }
}
</style>
