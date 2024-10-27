<template>
  <Modal
    :show="show"
    cls="add-column-modal"
    :cancelByClickingOutside="false"
    escapeEvent="keyup"
    @cancel="emit('cancel')"
  >
    <div class="modal-title">
      {{ t('custom_data.add_column') }}
    </div>
    <div class="modal-text">
      {{ t('custom_data.add_col_text') }}
    </div>
    <ColumnForm
      v-if="columnInfo"
      :showDelete="false"
      :info="columnInfo"
      class="column-info"
    />
    <ErrorMessage v-if="error" :error="error" />
    <div v-if="columnInfo" class="add-col-actions">
      <PSButton :text="t('ok')" class="add-col-button" @click="confirm" />
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
import { ErrorMessage, Modal, PSButton } from '@pubstudio/frontend/ui-widgets'
import { ICustomTableColumn } from '@pubstudio/shared/type-api-site-custom-data'
import ColumnForm from './ColumnForm.vue'
import { IEditTableColumn } from '../lib/i-edit-column'
import { verifyColumn } from '../lib/verify-column'
import { makeColumnInfo } from '@pubstudio/frontend/util-custom-data'

const { t } = useI18n()

const props = defineProps<{
  show: boolean
  columns: ICustomTableColumn[]
}>()
const { show, columns } = toRefs(props)
const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'create', info: ICustomTableColumn): void
}>()

const columnInfo = ref<IEditTableColumn>()
const error = ref()

watch(show, (newShow) => {
  if (newShow) {
    columnInfo.value = {
      name: '',
      default: '',
      data_type: 'TEXT',
      validators: {},
    }
  } else {
    columnInfo.value = undefined
  }
})

const confirm = () => {
  error.value = undefined
  const info = columnInfo.value
  if (info) {
    const colError = verifyColumn(info)
    if (colError) {
      error.value = t(colError)
    } else {
      emit(
        'create',
        makeColumnInfo({
          name: info.name,
          default: info.default,
          validation_rules: Object.values(info.validators).map((validator) => ({
            rule_type: validator.rule_type,
            parameter: validator.parameter ? parseInt(validator.parameter) : undefined,
          })),
        }),
      )
    }
  }
}
</script>

<style lang="postcss">
.add-column-modal {
  .modal-inner {
    max-width: 90%;
    width: 480px;
  }
  .add-col-actions {
    margin-top: 16px;
  }
  .add-col-button {
    margin-right: 16px;
  }
}
</style>
