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
    <div class="variable-selectors">
      <BuildMenuIcon
        :text="t('theme.select_color')"
        @click="showColorPicker = !showColorPicker"
      >
        <Theme />
      </BuildMenuIcon>
      <ThemeVariableFont
        class="theme-variable-font"
        @select="selectFont"
        @open="showColorPicker = false"
      />
    </div>
    <div v-if="showColorPicker" class="color-picker-wrap">
      <ColorPicker
        v-if="showColorPicker"
        :color="editColor"
        :forceNonGradient="true"
        :selectedThemeColors="selectedThemeColors"
        :resolveThemeVar="resolveThemeVar"
        class="theme-color-picker"
        @selectColor="selectPickerColor"
        @applyGradient="selectPickerGradient"
      />
    </div>
    <div v-else class="theme-variable-actions">
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
import { computed, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ErrorMessage, PSButton, Theme } from '@pubstudio/frontend/ui-widgets'
import {
  IThemeVariableEditState,
  useBuild,
  useThemeColors,
  useThemeMenuVariables,
} from '@pubstudio/frontend/feature-build'
import MenuRow from '../MenuRow.vue'
import { ColorPicker, IPickerColor } from '@pubstudio/frontend/feature-color-picker'
import { colorToCssValue } from '@pubstudio/frontend/feature-color-picker'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import { IThemedGradient } from '@pubstudio/frontend/util-gradient'
import { useClickaway } from '@pubstudio/frontend/util-clickaway'
import ThemeVariableFont from './ThemeVariableFont.vue'
import { BuildMenuIcon } from '../..'

const { t } = useI18n()

const { site } = useBuild()
const {
  editingThemeVariable,
  themeVariableError,
  clearEditingState,
  saveThemeVariable,
  editState,
} = useThemeMenuVariables()
const { selectedThemeColors } = useThemeColors()

const showColorPicker = ref(false)

const hidePicker = () => {
  showColorPicker.value = false
}

useClickaway('.theme-color-picker', hidePicker)

const editColor = computed(() => {
  if (editingThemeVariable.isColor) {
    return editingThemeVariable.resolved ?? editingThemeVariable.value
  }
  return ''
})

const resolveThemeVar = (themeVar: string): string | undefined => {
  return resolveThemeVariables(site.value.context, themeVar)
}

const selectPickerColor = (color: IPickerColor | undefined) => {
  const newValue = colorToCssValue(color, false)
  if (newValue !== undefined) {
    editingThemeVariable.value = newValue
    editingThemeVariable.resolved = resolveThemeVar(newValue)
  }
  showColorPicker.value = false
}

const selectPickerGradient = (_gradient: IThemedGradient | undefined) => {
  // TODO -- No easy way to represent the different CSS values necessary for setting a gradient
  // We could enable it so basic gradients can be used as a background color, but it would be
  // confusing when used as a text color.
}

const selectFont = (font: string | undefined) => {
  if (font) {
    editingThemeVariable.value = font
    editingThemeVariable.resolved = font
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.edit-theme-variable {
  @mixin flex-col;
  height: 100%;
}
.theme-variable-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  > button {
    width: 48%;
  }
}
.variable-selectors {
  display: flex;
  align-items: center;
}
.build-icon {
  margin: 0 auto;
}
.color-picker-wrap {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding-top: 8px;
}
.theme-color-picker {
  position: relative;
}
.theme-variable-font {
  margin-left: auto;
  width: 168px;
  height: 32px;
  margin-top: 6px;
}
.cancel-button {
  background-color: $grey-500;
  transition: opacity 0.2s ease;
  &:hover:not(:disabled) {
    background-color: $grey-500;
    opacity: 0.8;
  }
}
</style>
