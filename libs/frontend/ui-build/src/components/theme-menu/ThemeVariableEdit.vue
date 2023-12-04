<template>
  <div class="edit-theme-variable">
    <div v-if="editState === IThemeVariableEditState.Builtin" class="menu-row name">
      <div class="label">
        {{ t('name') }}
      </div>
      <div class="label">
        {{ editingThemeVariable.key }}
      </div>
    </div>
    <MenuRow
      v-else
      :label="t('name')"
      :value="editingThemeVariable.key"
      :forceEdit="true"
      :immediateUpdate="true"
      class="name"
      @update="editingThemeVariable.key = $event || ''"
    />
    <MenuRow
      :label="t('value')"
      :value="editingThemeVariable.value"
      :forceEdit="true"
      :immediateUpdate="true"
      :focusInput="!!editingThemeVariable.key"
      class="value"
      @update="editingThemeVariable.value = $event || ''"
    />
    <ErrorMessage :error="themeVariableError" />
    <div class="theme-variable-actions">
      <PSButton
        class="save-button"
        :text="t('save')"
        :secondary="true"
        background="#451dd6"
        @click.stop="saveThemeVariable"
      />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        :secondary="true"
        @click.stop="clearEditingState"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { ErrorMessage, PSButton } from '@pubstudio/frontend/ui-widgets'
import {
  IThemeVariableEditState,
  useThemeMenuVariables,
} from '@pubstudio/frontend/feature-build'
import MenuRow from '../MenuRow.vue'

const { t } = useI18n()

const {
  editingThemeVariable,
  themeVariableError,
  clearEditingState,
  saveThemeVariable,
  editState,
} = useThemeMenuVariables()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.edit-theme-variable {
  .theme-variable-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    > button {
      width: 48%;
    }
  }
}
</style>
