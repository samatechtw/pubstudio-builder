<template>
  <thead>
    <tr>
      <th class="select-all-wrap">
        <Checkbox
          :item="{ checked: allSelected }"
          :disabled="disableSelect"
          class="select-all"
          @checked="emit('selectAll')"
        />
      </th>
      <th v-for="column in columns" :key="column.name" class="th">
        <div v-if="editColumn && editColumn?.oldName === column.name" class="th-content">
          <PSInput v-model="editColumn.newName" class="name-input" />
          <Check class="check" color="#009879" @click="confirmEditName" />
          <Cross class="cancel" @click="editColumn = undefined" />
        </div>
        <div v-else class="th-content">
          <span class="column-name"> {{ column.name }}</span>
          <!-- Only TEXT type currently allowed
          <InfoBubble
            class="column-type-info"
            placement="top"
            :message="column.data_type.toString()"
          />
          -->
          <Edit class="edit" @click="editName(column.name)" />
        </div>
      </th>
      <th class="action">
        <Trash
          v-if="someSelected"
          color="#b7436a"
          class="trash"
          @click="emit('deleteRows')"
        />
        <Plus v-else class="plus" @click="emit('addRow')" />
      </th>
    </tr>
  </thead>
</template>

<script lang="ts" setup>
import {
  Check,
  Checkbox,
  Cross,
  Edit,
  Plus,
  PSInput,
  Trash,
} from '@pubstudio/frontend/ui-widgets'
import { ICustomTableColumn } from '@pubstudio/shared/type-api-site-custom-data'
import { ref } from 'vue'
import { IEditColumnName } from '../lib/i-edit-column'

defineProps<{
  columns: ICustomTableColumn[]
  allSelected: boolean
  someSelected: boolean
  disableSelect: boolean
}>()
const emit = defineEmits<{
  (e: 'addRow'): void
  (e: 'deleteRows'): void
  (e: 'editColumn', nameInfo: IEditColumnName): void
  (e: 'selectAll'): void
}>()
const editColumn = ref<IEditColumnName>()

const editName = (name: string) => {
  editColumn.value = { oldName: name, newName: name }
}

const confirmEditName = () => {
  if (editColumn.value?.newName) {
    emit('editColumn', editColumn.value)
    editColumn.value = undefined
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

th {
  @mixin text 15px;
  padding: 12px 16px;
  white-space: nowrap;
  color: $color-primary;
  background-color: $grey-200;
  width: v-bind(100 * (1 / columns.length) + '%');
  &:not(:first-child) {
    border-left: 1px solid $grey-300;
  }
}
th.select-all-wrap {
  width: 44px;
  padding: 12px 6px;
  cursor: pointer;
}
.select-all {
  @mixin size 22px;
  margin: 0 auto;
  :deep(.checkmark) {
    margin: 0 auto;
  }
}
.th-content {
  @mixin flex-row;
  align-items: center;
}
.column-type-info {
  @mixin size 18px;
  margin: 2px 0 0 6px;
}
.plus {
  @mixin size 22px;
  cursor: pointer;
}
.trash {
  @mixin size 22px;
  cursor: pointer;
}
.check {
  @mixin size 22px;
  margin-left: 8px;
  cursor: pointer;
}
.cancel {
  margin-left: 6px;
  cursor: pointer;
}
.col-edit {
  @mixin flex-center;
}
.edit {
  @mixin size 22px;
  margin-left: 6px;
  cursor: pointer;
}
.name-input :deep(.ps-input) {
  height: 36px;
}
</style>
