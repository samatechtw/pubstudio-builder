<template>
  <Modal
    :show="show"
    cls="site-error-modal"
    :cancelByClickingOutside="false"
    @cancel="emit('cancel')"
  >
    <div class="modal-title">
      {{ t('build.site_error') }}
    </div>
    <div class="modal-text">
      {{ t('build.site_error_text_1') }}
    </div>
    <div v-if="siteError" class="site-error-detail">
      {{ t(siteError) }}
    </div>
    <div class="modal-text">
      {{ t('build.site_error_text_2') }}
    </div>
    <div class="modal-actions">
      <PSButton
        :text="t('build.site_error_export')"
        class="export-button"
        @click="showExport = true"
      />
      <PSButton
        v-if="showSupport"
        :text="t('build.site_error_contact')"
        class="contact-button"
        @click="contactSupport"
      />
      <PSButton
        :text="t('build.site_error_clear')"
        class="clear-button"
        @click="showClear = true"
      />
    </div>
    <ConfirmModal
      :show="showClear"
      :title="t('build.site_error_clear')"
      :text="t('build.confirm_reset_text')"
      @confirm="clearSiteError"
      @cancel="showClear = false"
    />
    <ExportModal
      :site="site"
      :show="showExport"
      :defaultFileName="defaultFileName"
      @confirmExport="showExport = false"
      @cancel="showExport = false"
    />
  </Modal>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useBuild } from '@pubstudio/frontend/feature-build'
import {
  ConfirmModal,
  ExportModal,
  Modal,
  PSButton,
} from '@pubstudio/frontend/ui-widgets'
import { defaultExportedFileName } from '@pubstudio/frontend/util-doc-site'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    show: boolean
    siteId: string
    showSupport?: boolean
  }>(),
  { showSupport: true },
)

const { siteId } = toRefs(props)

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const showClear = ref(false)
const showExport = ref(false)

const { siteError } = useSiteSource()
const { site, resetSite } = useBuild()

const contactSupport = () => {
  const subject = `Site Error for Site: ${siteId.value}`
  const url = `mailto:support@pubstud.io?subject=${subject}&body=${siteError.value}`
  window.open(url, '_blank')
}

const clearSiteError = () => {
  siteError.value = undefined
  resetSite()
}

const defaultFileName = computed(() => defaultExportedFileName(site.value.name))
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.site-error-detail {
  padding: 8px;
  margin-top: 16px;
  max-height: 120px;
  overflow-y: auto;
  color: $color-text;
  word-break: break-all;
  background-color: lightgray;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  .contact-button {
    margin-top: 16px;
  }
  .clear-button {
    margin-top: 16px;
  }
}
</style>
