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
      {{ isHistory ? t('build.save_history') : t('build.save_error_text') }}
    </div>
    <div class="site-error-detail">
      {{ error?.message }}
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
        :text="t('build.site_error_contact')"
        class="contact-button"
        @click="contactSupport"
      />
      <PSButton :text="t('build.refresh')" class="refresh-button" @click="refreshPage" />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { Modal, PSButton } from '@pubstudio/frontend/ui-widgets'
import { saveSite, defaultExportedFileName } from '@pubstudio/frontend/util-site-store'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { useCommand } from '@pubstudio/frontend/feature-command'
import { IApiError } from '@pubstudio/shared/type-api'

const { t } = useI18n()

const { siteStore } = useSiteSource()
const { site } = useBuild()
const { clearAll, clearPartial } = useCommand()
const show = ref(false)

const isHistory = computed(() => {
  return siteStore.value.saveError?.message?.startsWith('History')
})

const error = computed(() => {
  return siteStore.value.saveError
})

watch(error, (newError: IApiError | undefined) => {
  if (newError) {
    if (isHistory.value) {
      clearPartial(0.3)
    } else {
      show.value = true
    }
  } else {
    show.value = false
  }
})

const contactSupport = () => {
  const subject = `Site Errror for Site: ${site.value.name}`
  const url = `mailto:support@pubstud.io?subject=${subject}&body=${siteStore.value.saveError}`
  window.open(url, '_blank')
}

const exportSite = () => {
  saveSite(site.value, defaultExportedFileName(site.value.name))
}

const clearHistory = () => {
  clearAll()
  cancel()
}

const refreshPage = () => {
  location.reload()
}

const cancel = () => {
  siteStore.value.saveError = undefined
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
  }
}
</style>
