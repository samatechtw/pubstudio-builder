<template>
  <div class="theme-variables-list">
    <!-- Custom -->
    <div class="theme-variables-wrap">
      <div class="custom-title">
        <div class="label">
          {{ t('theme.custom') }}
        </div>
        <InfoBubble
          v-if="themeVariables.custom.length"
          :message="t('build.select_color_info')"
          :showArrow="false"
          placement="top"
          class="custom-info-bubble"
        />
        <div class="item new-theme-variable-button" @click.stop="newThemeVariable">
          <Plus class="item-add" />
        </div>
      </div>
      <div v-if="themeVariables.custom.length" class="theme-variables">
        <div
          v-for="variable in themeVariables.custom"
          :key="variable.key"
          class="variable-entry edit-item"
        >
          <div
            class="variable-preview"
            @click="setEditingThemeVariable(variable, IThemeVariableEditState.Custom)"
          >
            <div class="variable-name">
              {{ variable.key }}
            </div>
            <div class="variable-value">
              {{ variable.value }}
            </div>
            <template v-if="variable.isColor">
              <Checkbox
                class="select-color-checkbox"
                :item="{ label: '', checked: selectedThemeColors?.has(variable.key) }"
                @checked="toggleSelectedColor(variable.key)"
                @click.stop
              />
              <div
                class="variable-color"
                :style="{ 'background-color': variable.value }"
              />
            </template>
          </div>
          <Minus class="item-delete" @click="removeThemeVariable(variable)" />
        </div>
      </div>
      <div v-else class="theme-variables-empty">
        {{ t('theme.no_custom') }}
      </div>
    </div>
    <!-- Builtin -->
    <div class="theme-variables-wrap">
      <div class="builtin-title">
        <div class="label">
          {{ t('theme.builtin') }}
        </div>
        <InfoBubble
          :message="t('build.select_color_info')"
          :showArrow="false"
          placement="top"
          class="builtin-info-bubble"
        />
      </div>
      <div v-if="themeVariables.builtin.length" class="theme-variables">
        <div
          v-for="variable in themeVariables.builtin"
          :key="variable.key"
          class="variable-entry edit-item"
        >
          <div
            class="variable-preview builtin"
            @click="setEditingThemeVariable(variable, IThemeVariableEditState.Builtin)"
          >
            <div class="variable-name">
              {{ variable.key }}
            </div>
            <div class="variable-value">
              {{ variable.value }}
            </div>
            <template v-if="variable.isColor">
              <Checkbox
                class="select-color-checkbox"
                :item="{ label: '', checked: selectedThemeColors?.has(variable.key) }"
                @checked="toggleSelectedColor(variable.key)"
                @click.stop
              />
              <div
                class="variable-color"
                :style="{ 'background-color': variable.value }"
              />
            </template>
          </div>
        </div>
      </div>
      <div v-else class="theme-variables-empty">
        {{ t('theme.no_builtin') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { Checkbox, InfoBubble, Minus, Plus } from '@pubstudio/frontend/ui-widgets'
import { IThemeVariable } from '@pubstudio/shared/type-site'
import {
  IThemeVariableEditState,
  useThemeMenuVariables,
  useBuild,
} from '@pubstudio/frontend/feature-build'
import { selectColor, unselectColor } from '@pubstudio/frontend/util-command'

const { t } = useI18n()

const { themeVariables, newThemeVariable, setEditingThemeVariable } =
  useThemeMenuVariables()

const { editor, deleteThemeVariable } = useBuild()
const { selectedThemeColors } = editor.value ?? {}

const toggleSelectedColor = (id: string) => {
  if (selectedThemeColors?.has(id)) {
    unselectColor(editor.value, id)
  } else {
    selectColor(editor.value, id)
  }
}

const removeThemeVariable = (themeVariable: IThemeVariable) => {
  deleteThemeVariable({
    key: themeVariable.key,
    value: themeVariable.value,
  })
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.theme-variables-list {
  @mixin menu;
  padding: 0;
  width: 100%;
  .custom-info-bubble,
  .builtin-info-bubble {
    margin: 0 23px 0 0;
  }
  .theme-variables-wrap {
    width: 100%;
    .builtin-title,
    .custom-title {
      @mixin flex-row;
      align-items: center;
      .label {
        font-weight: bold;
        flex-grow: 1;
      }
    }
    .theme-variables {
      margin-top: 4px;
    }
    & + .theme-variables-wrap {
      margin-top: 24px;
    }
  }
  .theme-variables-empty {
    padding-top: 16px;
    @mixin text-medium 16px;
    color: $grey-500;
  }
}

.variable-entry {
  padding: 12px 0;
  justify-content: space-between;
  border-bottom: 1px solid $grey-100;
  cursor: default;
  .variable-preview {
    @mixin flex-row;
    flex-grow: 1;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    align-items: center;
    .variable-value {
      color: $grey-500;
      margin: 0 auto 0 16px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .select-color-checkbox {
      margin: 0 2px 0 0;
    }
    .variable-color {
      @mixin size 14px;
      border: 1px solid #313233;
    }
  }
  .item-delete {
    margin-left: 8px;
  }
}
</style>
