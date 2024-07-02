<template>
  <Modal :show="show" cls="delete-draft-modal" @cancel="emit('close')">
    <div class="modal-title">
      {{ t('sites.delete_draft') }}
    </div>
    <div class="modal-text">
      {{ t('sites.delete_draft_text') }}
    </div>
    <ErrorMessage :error="error && t(error)" />
    <div v-if="confirmDelete" class="confirm">
      {{ t('sites.confirm_delete_draft') }}
    </div>
    <div class="modal-buttons">
      <PSButton
        class="publish-button"
        :text="t('sites.publish_delete')"
        :animate="loading"
        size="small"
        @click="publishDeleteDraft"
      />
      <PSButton
        class="delete-button"
        :text="t('sites.delete_draft')"
        size="small"
        :animate="loading"
        @click="confirmDeleteDraft"
      />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        size="small"
        variant="secondary"
        @click="emit('close')"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { ErrorMessage, Modal, PSButton } from '@pubstudio/frontend/ui-widgets'
import { useSiteVersion } from '@pubstudio/frontend/feature-site-version'
import { ref, toRefs, watch } from 'vue'

const { t } = useI18n()
const { error, loading, deleteDraft, publishSite } = useSiteVersion()

const confirmDelete = ref(false)

const emit = defineEmits<{
  (e: 'close'): void
}>()
const props = defineProps<{
  show: boolean
}>()
const { show } = toRefs(props)

const executeDeleteDraft = async () => {
  await deleteDraft()
  if (!error.value) {
    emit('close')
  }
}

const publishDeleteDraft = async () => {
  await publishSite()
  if (!error.value) {
    await executeDeleteDraft()
  }
}

const confirmDeleteDraft = async () => {
  if (confirmDelete.value) {
    await executeDeleteDraft()
  } else {
    confirmDelete.value = true
  }
}

watch(show, () => {
  error.value = undefined
  confirmDelete.value = false
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.delete-draft-modal {
  .modal-buttons {
    .p-button {
      height: 44px;
    }
  }
  .confirm {
    @mixin title 14px;
    margin-top: 16px;
    color: $color-red;
  }
  .delete-button {
    background-color: $color-red;
    margin: 0 12px;
    &:hover,
    &:focus {
      background-color: rgba($color-red, 0.8);
    }
  }
}
</style>
