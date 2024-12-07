<template>
  <Modal :show="show" cls="import-i18n-modal" @cancel="emit('cancel')">
    <div class="modal-title">
      {{ t('i18n.import') }}
    </div>
    <div class="modal-text">
      {{ t('i18n.import_text') }}
    </div>
    <div class="modal-text i18n-warning">
      <img src="@frontend-assets/icon/warning.png" class="warn" />
      <div>{{ t('i18n.import_alpha') }}</div>
    </div>
    <div class="import-wrap">
      <SimpleFileUpload
        id="i18n-import"
        class="i18n-import"
        accept="text/csv"
        @selectFile="selectFile"
      >
        <div class="csv-select">
          {{ t('custom_data.select') }}
        </div>
      </SimpleFileUpload>
      <div class="i18n-file">
        {{ fileName }}
      </div>
      <Minus v-if="fileName" class="remove" @click="clearFile" />
    </div>
    <div v-if="fileName" class="import-options">
      <!--
      <Checkbox
        class="skip-error"
        :item="{
          label: t('custom_data.skip_error'),
          checked: skipError,
        }"
        @checked="skipError = $event"
      />
      -->
      <div class="import-option">
        <Checkbox
          class="skip-empty"
          :item="{
            label: t('i18n.include_empty'),
            checked: includeEmpty,
          }"
          @checked="includeEmpty = $event"
        />
        <InfoBubble placement="right" :message="t('i18n.empty_text')" />
      </div>
    </div>
    <div v-if="fileName" class="import-lines">
      <span>{{ t('custom_data.new_rows') }}</span>
      <span class="new-rows">{{ rowCount }}</span>
    </div>
    <ErrorMessage v-if="error" :error="error" class="import-error" />
    <ErrorMessage v-if="invalidRows" :error="invalidRows" class="import-error" />
    <div class="modal-buttons">
      <PSButton
        class="confirm-button"
        :text="t('confirm')"
        :animate="loading"
        @click="importI18n"
      />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        :secondary="true"
        @click="emit('cancel')"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { loadFile } from '@pubstudio/frontend/util-doc'
import {
  Checkbox,
  ErrorMessage,
  InfoBubble,
  Minus,
  Modal,
  PSButton,
  SimpleFileUpload,
} from '@pubstudio/frontend/ui-widgets'
import { getSplitChar, parseCsvRow } from '@pubstudio/shared/util-parse'
import { ITranslations } from '@pubstudio/shared/type-site'
import { replaceAllTranslations } from '@pubstudio/frontend/feature-build'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const i18n = useI18n()
const { t } = i18n
const { site } = useSiteSource()

const props = defineProps<{
  show: boolean
}>()
const { show } = toRefs(props)

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const fileName = ref()
const invalidRows = ref()
const duplicates = ref(0)
const error = ref()
const loading = ref(false)
// const skipError = ref(false)
const includeEmpty = ref(true)
const rowCount = ref(0)
const translations = ref<Record<string, ITranslations>>({})

const selectFile = async (file: File) => {
  clearFile()
  const i18nString = await loadFile(file)
  if (i18nString) {
    const rows = i18nString.split('\n')
    const row1 = rows[0]
    if (!row1) {
      error.value = t('errors.rows_missing')
      return
    }
    const langs = parseCsvRow(row1).slice(1)
    const trans: Record<string, ITranslations> = {}
    const keys = new Set()
    for (const lang of langs) {
      trans[lang] = {}
    }
    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i]
      // Skip blank lines
      if (!row) {
        continue
      }
      const [key, ...values] = parseCsvRow(row)
      if (keys.has(key)) {
        error.value = `${t('errors.duplicate_key')}${i + 1}`
        duplicates.value += 1
        continue
      }
      keys.add(key)
      if (values.length > langs.length) {
        console.log('IT', values, langs)
        error.value = `${t('errors.row_length')} ${i + 1}`
        return
      }
      for (let langIndex = 0; langIndex < values.length; langIndex += 1) {
        const value = values[langIndex] ?? ''
        const lang = langs[langIndex]
        if (!includeEmpty.value || value) {
          trans[lang][key] = value
        }
      }
      rowCount.value += 1
    }
    translations.value = trans
    if (duplicates.value > 0) {
      error.value += `, ${duplicates.value} total`
    }
    fileName.value = file.name
  }
}

const clearFile = () => {
  fileName.value = undefined
  invalidRows.value = undefined
  error.value = undefined
  duplicates.value = 0
  rowCount.value = 0
}

const importI18n = async () => {
  replaceAllTranslations(site.value, translations.value)
  emit('cancel')
}

watch(show, () => {
  clearFile()
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.import-i18n-modal {
  .modal-inner {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    max-width: 90%;
    width: 540px;
  }
  .modal-buttons {
    .confirm-button {
      margin-right: 8px;
      min-width: 94px;
    }
    .cancel-button {
      margin-left: 8px;
    }
  }
  .i18n-warning {
    display: flex;
    align-items: center;
  }
  .warn {
    @mixin size 24px;
    margin-right: 8px;
  }
  .import-wrap {
    display: flex;
    align-items: center;
    margin-top: 16px;
    font-size: 14px;
  }
  .i18n-import {
    margin-right: 8px;
  }
  .i18n-file {
    @mixin truncate;
    max-width: 240px;
  }
  .import-options {
    display: flex;
    margin-top: 12px;
    .checkbox {
      margin: 0 16px 0 0;
    }
  }
  .import-option {
    display: flex;
    align-items: center;
    .checkbox {
      margin: 0 8px 0 0;
    }
  }
  .csv-select {
    font-size: 15px;
    padding: 6px 12px;
  }
  .import-lines {
    margin-top: 12px;
  }
  .new-rows {
    font-weight: bold;
    margin-left: 6px;
  }
  .remove {
    @mixin size 22px;
    margin-left: 8px;
    cursor: pointer;
  }
  .import-error .error {
    padding-top: 12px;
  }
  .modal-buttons {
    margin-top: 24px;
  }
}
</style>
