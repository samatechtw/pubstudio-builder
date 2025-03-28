<template>
  <Modal
    :show="show"
    cls="site-save-error-modal"
    :cancelByClickingOutside="false"
    @cancel="cancel"
  >
    <div class="modal-title">
      {{ t('build.save_error') }}
    </div>
    <div class="modal-text">
      {{ errorText }}
    </div>
    <div v-if="!isStale" class="site-error-detail">
      {{ siteError?.message }}
    </div>
    <div class="modal-text">
      {{ t('build.site_error_text_2') }}
    </div>
    <div class="modal-actions">
      <PSButton
        v-if="isHistory"
        :text="t('history.clear')"
        class="clear-button"
        @click="clearHistory"
      />
      <PSButton
        :text="t('build.site_error_export')"
        class="export-button"
        @click="exportSite"
      />
      <PSButton
        v-if="!isValidateError"
        :text="t('build.refresh')"
        class="refresh-button"
        @click="refreshPage"
      />
      <PSButton
        v-if="isStale || isValidateError"
        :text="t(isStale ? 'build.overwrite' : 'try')"
        :secondary="true"
        class="overwrite-button"
        @click="overwriteData"
      />
      <PSButton
        :text="t('build.site_error_contact')"
        class="contact-button"
        @click="contactSupport"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { Modal, PSButton } from '@pubstudio/frontend/ui-widgets'
import { saveSite, defaultExportedFileName } from '@pubstudio/frontend/util-doc-site'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { clearAll, clearPartial } from '@pubstudio/frontend/data-access-command'
import { IApiError, ApiErrorCode } from '@pubstudio/shared/type-api'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'unauthorized'): void
}>()

const { siteStore, site } = useSiteSource()
const show = ref(false)

const isHistory = computed(() => {
  return siteError.value?.message?.startsWith('History')
})

const isStale = computed(() => {
  return siteError.value?.code === ApiErrorCode.UpdateStale
})

const isValidateError = computed(() => {
  return siteError.value?.code === ApiErrorCode.InvalidFormData
})

const siteError = computed<IApiError | undefined>(() => {
  return siteStore.saveError
})

watch(siteError, (newError: IApiError | undefined) => {
  if (newError) {
    if (isHistory.value) {
      clearPartial(site.value, 0.3)
    } else if (newError.status === 401) {
      emit('unauthorized')
    } else {
      show.value = true
    }
  } else {
    show.value = false
  }
})

const errorText = computed(() => {
  if (isHistory.value) {
    return t('build.save_history')
  } else if (isStale.value) {
    return t('build.stale')
  } else if (isValidateError.value) {
    return t('build.save_server_error')
  } else {
    return t('build.save_error_text')
  }
})

const contactSupport = () => {
  const subject = `Site Error for Site: ${site.value.name}`
  const url = `mailto:support@pubstud.io?subject=${subject}&body=${siteStore.saveError}`
  window.open(url, '_blank')
}

const exportSite = () => {
  saveSite(site.value, defaultExportedFileName(site.value.name))
}

const overwriteData = () => {
  siteStore.save(site.value, { immediate: true, ignoreUpdateKey: true })
  cancel()
}

const clearHistory = () => {
  clearAll(site.value)
  cancel()
}

const refreshPage = () => {
  location.reload()
}

const cancel = () => {
  siteStore.saveError = undefined
}
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.site-save-error-modal {
  .modal-inner {
    max-height: 95%;
    overflow-y: scroll;
  }
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
      margin-bottom: 16px;
    }
    .refresh-button {
      margin-top: 16px;
    }
    .overwrite-button {
      margin-top: 16px;
    }
  }
}
</style>
