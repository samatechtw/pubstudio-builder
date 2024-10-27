<template>
  <tr>
    <td class="select-wrap"></td>
    <td v-for="column in columns" :key="column.name">
      <STInput v-model="newRow[column.name]" class="row-input" />
    </td>
    <td class="action">
      <Check class="check" color="#009879" @click="confirm" />
      <Cross class="cancel" @click="emit('cancel')" />
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs } from 'vue'
import { STInput } from '@samatech/vue-components'
import { Cross, Check } from '@pubstudio/frontend/ui-widgets'
import {
  ICustomTableColumn,
  ICustomTableRow,
} from '@pubstudio/shared/type-api-site-custom-data'
import { defaultCustomRow } from '../lib/default-custom-row'

const props = defineProps<{
  columns: ICustomTableColumn[]
  row: ICustomTableRow
  isNew?: boolean
}>()
const { row, columns, isNew } = toRefs(props)

const emit = defineEmits<{
  (e: 'confirm', row: ICustomTableRow): void
  (e: 'cancel'): void
}>()

const newRow = ref(defaultCustomRow(columns.value))

const confirm = () => {
  const updatedRow: ICustomTableRow = { id: newRow.value.id }
  if (!isNew.value) {
    for (const key of Object.keys(row.value)) {
      if (row.value[key] !== newRow.value[key]) {
        updatedRow[key] = newRow.value[key]
      }
    }
    if (Object.values(updatedRow).length === 0) {
      emit('cancel')
    }
  }
  emit('confirm', updatedRow)
}

onMounted(() => {
  newRow.value = { ...row.value }
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

td.select-wrap {
  width: 44px;
  padding: 12px 6px;
  cursor: pointer;
}
.check {
  @mixin size 22px;
}
.action {
  @mixin flex-center;
  padding: 12px 8px;
  width: 60px;
  cursor: pointer;
}
.row-input :deep(.st-input) {
  height: 38px;
}
.cancel {
  margin-left: 8px;
}
td {
  .action {
    border-top: 1px solid $grey-300;
  }
  &:not(:first-child) {
    border-left: 1px solid $grey-300;
  }
}
</style>
