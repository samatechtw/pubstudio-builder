<template>
  <Modal
    :show="!!editor?.translations"
    cls="translations-modal"
    :cancelByClickingOutside="false"
    @cancel="closeTranslations"
  >
    <div class="modal-title">
      {{ t('i18n.title') }}
    </div>
    <div class="modal-text">
      {{ t('i18n.text') }}
    </div>
    <div v-if="editTranslation" class="i18n-edit">
      <div class="i18n-edit-top">
        <STInput
          v-model="editTranslation.key"
          :placeholder="t('key')"
          class="i18n-edit-key"
        />
        <PSButton
          :text="t('save')"
          size="small"
          class="i18n-button"
          @click="saveTranslation"
        />
        <ErrorMessage :error="saveTranslationError" />
        <PSButton
          v-if="
            editTranslation.isNew || editTranslation.originalKey === editTranslation.key
          "
          :text="t('cancel')"
          size="small"
          class="i18n-button"
          @click="cancelTranslation"
        />
      </div>
      <div ref="editorRef" class="i18n-editor"></div>
    </div>
    <div v-else class="translations-wrap">
      <div class="i18n-options">
        <STMultiselect
          :value="editor?.editorI18n ?? 'en'"
          :options="currentLanguages"
          :disabled="currentLanguages.length <= 1"
          @select="selectActiveLanguage"
        />
        <div v-if="addLanguage" class="i18n-new">
          <STMultiselect
            :value="newLanguage"
            :options="newLanguages"
            :openInitial="true"
            :searchable="true"
            @select="selectNewLanguage"
          />
          <Cross class="i18n-new-cancel" @click="confirmAddLanguage" />
        </div>
        <div
          v-else-if="newLanguages.length > 0"
          class="i18n-add"
          @click="showAddLanguage"
        >
          {{ t('i18n.add') }}
        </div>
        <PSButton
          :text="t('i18n.new')"
          class="translation-new"
          size="small"
          @click="showEditTranslation(undefined)"
        />
        <PSMenu :items="tableActions" class="actions-dropdown">
          <template #toggle>
            <DotsIcon color="#000" />
          </template>
        </PSMenu>
      </div>
      <div class="translations">
        <div v-if="activeKeys.length === 0" class="i18n-empty">
          {{ t('i18n.empty') }}
        </div>
        <div v-for="key in activeKeys" :key="key" class="translation">
          <div class="i18n-key" @click="showEditTranslation(key)">
            {{ key }}
          </div>
          <div class="i18n-value" @click="showEditTranslation(key)">
            {{ activeTranslations[key] }}
          </div>
          <div v-if="confirmDeleteTranslation === key" class="delete-options">
            <Check class="confirm-delete" @click="deleteTranslation()" />
            <Cross class="cancel-delete" @click="confirmDeleteTranslation = undefined" />
          </div>
          <Minus v-else class="item-delete" @click="confirmDeleteTranslation = key" />
        </div>
      </div>
    </div>
    <ConfirmModal
      :show="!!confirmSaveTranslationKey"
      :title="t('i18n.confirm_title')"
      :text="t('i18n.confirm_text', { key: confirmSaveTranslationKey })"
      @confirm="confirmSaveTranslation"
      @cancel="confirmSaveTranslationKey = undefined"
    />
    <ImportTranslations :show="showImport" @cancel="showImport = false" />
    <ExportTranslations :show="showExport" @cancel="showExport = false" />
    <ConvertTranslations :show="showConvert" @cancel="showConvert = false" />
  </Modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { STMultiselect } from '@samatech/vue-components'
import { STInput } from '@samatech/vue-components'
import {
  Check,
  Cross,
  Modal,
  ErrorMessage,
  Minus,
  PSButton,
  ConfirmModal,
  PSMenu,
  DotsIcon,
} from '@pubstudio/frontend/ui-widgets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { useSiteTranslations } from '../lib/use-site-translations'
import { IMultiselectObj } from '@pubstudio/frontend/type-ui-widgets'
import { ref } from 'vue'
import ExportTranslations from './ExportTranslations.vue'
import ImportTranslations from './ImportTranslations.vue'
import ConvertTranslations from './ConvertTranslations.vue'

const { t } = useI18n()
const { editor } = useSiteSource()
const {
  editTranslation,
  editorRef,
  saveTranslationError,
  addLanguage,
  confirmAddLanguage,
  newLanguage,
  newLanguages,
  currentLanguages,
  activeKeys,
  activeTranslations,
  selectActiveLanguage,
  showEditTranslation,
  saveTranslation,
  closeTranslations,
  deleteTranslation,
  confirmDeleteTranslation,
  confirmSaveTranslation,
  confirmSaveTranslationKey,
  cancelTranslation,
} = useSiteTranslations()

const showExport = ref(false)
const showImport = ref(false)
const showConvert = ref(false)

const showAddLanguage = () => {
  addLanguage.value = true
}

const selectNewLanguage = (lang: IMultiselectObj | undefined) => {
  newLanguage.value = lang?.value as string
  confirmAddLanguage()
}

const tableActions = [
  {
    label: t('export'),
    class: 'export-i18n',
    click: () => (showExport.value = true),
  },
  {
    label: t('import'),
    class: 'import-i18n',
    click: () => (showImport.value = true),
  },
  {
    label: t('i18n.convert'),
    class: 'convert-i18n',
    click: () => (showConvert.value = true),
  },
]
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.translations-modal {
  .modal-inner {
    @mixin flex-col;
    width: 800px;
    max-width: 95%;
    max-height: 95%;
    height: 95%;
    overflow-y: scroll;
  }

  .modal-text {
    @mixin text 15px;
    margin: 8px 0 16px;
  }
  .i18n-options {
    display: flex;
    align-items: center;
  }
  .i18n-add {
    @mixin title-medium 14px;
    margin-left: 12px;
    cursor: pointer;
    user-select: none;
  }
  .i18n-new {
    display: flex;
    align-items: center;
    margin-left: 12px;
  }
  .i18n-new-cancel {
    @mixin size 18px;
    margin-left: 8px;
    cursor: pointer;
  }
  .translation-new {
    margin-left: 24px;
  }
  .item-add {
    margin-left: 6px;
  }
  .translations-wrap {
    @mixin flex-col;
    flex: 1;
  }
  .translations {
    @mixin flex-col;
    flex: 1;
    margin-top: 12px;
  }
  .translation {
    @mixin text 14px;
    color: $color-text;
    display: flex;
    padding: 6px;
    cursor: pointer;
    &:nth-child(2n) {
      background-color: $grey-100;
    }
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  .item-delete {
    margin-left: auto;
    path {
      fill: transparent;
    }
  }
  .delete-options {
    @mixin flex-row;
    align-items: center;
  }
  .confirm-delete {
    width: 24px;
    height: auto;
  }
  .cancel-delete {
    @mixin size 18px;
    margin-left: 6px;
  }
  .actions-dropdown {
    margin-left: auto;
  }
  .i18n-key {
    width: 180px;
    font-weight: bold;
    flex-shrink: 0;
  }
  .i18n-value {
    @mixin truncate;
    width: 100%;
    margin-right: 6px;
  }
  .i18n-empty {
    @mixin flex-center;
    @mixin text-medium 16px;
    color: $grey-500;
    width: 100%;
    flex: 1;
  }
  .i18n-edit {
    @mixin flex-col;
    flex: 1;
  }
  .i18n-edit-key {
    max-width: 240px;
    margin-right: 12px;
  }
  .i18n-edit-top {
    display: flex;
    align-items: center;
    .error {
      padding: 0 0 0 16px;
    }
  }
  .i18n-button {
    margin-left: 8px;
  }
  .p-button {
    padding-left: 20px;
    padding-right: 20px;
    min-width: 50px;
  }
  .i18n-edit {
    @mixin flex-col;
    flex: 1;
  }
  .i18n-editor {
    @mixin flex-col;
    color: $color-text;
    flex: 1;
  }
  .pm-style {
    height: 100%;
    margin-top: 16px;
    padding: 6px;
    border: 1px solid $border1;
  }
}
</style>
