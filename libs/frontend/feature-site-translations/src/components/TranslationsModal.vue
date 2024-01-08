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
        <PSInput
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
        <PSMultiselect
          :value="site.context.activeI18n ?? 'en'"
          :options="currentLanguages"
          :disabled="currentLanguages.length <= 1"
          @select="selectActiveLanguage"
        />
        <div v-if="addLanguage" class="i18n-new" @click="confirmAddLanguage">
          <PSMultiselect
            :value="newLanguage"
            :options="newLanguages"
            :openInitial="true"
            @select="selectNewLanguage"
          />
          <Check class="i18n-new-save" color="#009879" />
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
  </Modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import {
  Check,
  Cross,
  Modal,
  ErrorMessage,
  Minus,
  PSButton,
  PSInput,
  PSMultiselect,
  ConfirmModal,
} from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { useSiteTranslations } from '../lib/use-site-translations'
import { IMultiselectObj } from '@pubstudio/frontend/type-ui-widgets'

const { t } = useI18n()
const { editor, site } = useBuild()
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

const showAddLanguage = () => {
  addLanguage.value = true
}

const selectNewLanguage = (lang: IMultiselectObj) => {
  newLanguage.value = lang.value as string
}
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
  .i18n-new-save {
    @mixin size 24px;
    margin-left: 8px;
    cursor: pointer;
  }
  .translation-new {
    margin-left: auto;
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
