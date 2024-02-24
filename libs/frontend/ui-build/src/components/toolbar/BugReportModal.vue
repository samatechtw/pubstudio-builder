<template>
  <Modal cls="confirm-modal" @cancel="emit('cancel')">
    <div class="modal-title">
      {{ t('toolbar.bug_title') }}
    </div>
    <div class="modal-text" v-html="t('toolbar.bug_text')"></div>
    <div class="modal-buttons">
      <PSButton
        :text="t('contact')"
        class="contact-button"
        :secondary="true"
        @click="contactSupport"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { Modal, PSButton } from '@pubstudio/frontend/ui-widgets'

const { t } = useI18n()
const { site } = useBuild()

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const contactSupport = () => {
  const subject = `Bug Report: ${site.value.name}`
  const body = 'Please describe the bug with as much detail as possible'
  const url = `mailto:support@pubstud.io?subject=${subject}&body=${body}`
  window.open(url, '_blank')
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.modal-buttons {
  @mixin flex-row;
}
.modal-buttons {
  display: flex;
  justify-content: center;
}
:deep(a) {
  color: $purple-500;
}
</style>
