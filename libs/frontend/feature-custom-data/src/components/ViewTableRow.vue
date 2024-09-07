<template>
  <tr>
    <td class="select-wrap">
      <Checkbox
        :item="{ checked: selected }"
        class="select"
        :disabled="disableSelect"
        @checked="emit('select')"
      />
    </td>
    <td v-for="column in columns" :key="`${column.name}-${row.id}`">
      {{ row[column.name] }}
    </td>
    <td class="action">
      <Edit class="edit" @click="emit('edit')" />
    </td>
  </tr>
</template>

<script lang="ts" setup>
import { Checkbox, Edit } from '@pubstudio/frontend/ui-widgets'
import {
  ICustomTableColumn,
  ICustomTableRow,
} from '@pubstudio/shared/type-api-site-custom-data'

defineProps<{
  columns: ICustomTableColumn[]
  row: ICustomTableRow
  selected: boolean
  disableSelect: boolean
}>()

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'select'): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

td.select-wrap {
  width: 44px;
  padding: 12px 6px;
  cursor: pointer;
}
.select {
  @mixin size 22px;
  margin: 0 auto;
  :deep(.checkmark) {
    margin: 0 auto;
  }
}
.action {
  @mixin flex-center;
  padding: 12px 8px;
  width: 60px;
  cursor: pointer;
}
.check {
  @mixin size 22px;
}
.edit {
  @mixin size 24px;
}
.minus {
  @mixin size 20px;
  margin-left: 8px;
}
td {
  @mixin body-small;
  font-size: 14px;
  padding: 4px 16px;
  background-color: white;
  .action {
    border-top: 1px solid $grey-300;
  }
  &:not(:first-child) {
    border-left: 1px solid $grey-300;
  }
}
</style>
