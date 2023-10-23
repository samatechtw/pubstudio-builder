<template>
  <div class="style-menu-edit">
    <MenuRow
      :label="t('name')"
      :value="editingStyle.name"
      :forceEdit="true"
      :immediateUpdate="true"
      class="name"
      @update="editingStyle.name = $event || ''"
    />
    <EditMenuTitle
      :title="t('style.styles')"
      :subTitle="menuSubTitle"
      @add="newEditingStyleProp"
    />
    <StyleRow
      v-for="(entry, index) in editingStyleEntries"
      :key="`${entry.pseudoClass}-${entry.property}`"
      :modelValue="editingStyleEntries[index]"
      :editing="!entry.property || editing(entry.property)"
      class="menu-row"
      @edit="editStyle"
      @update="updateStyle(index, $event)"
      @remove="removeStyle(index)"
      @update:modelValue="updateEditingStyleProp(index, $event)"
    />
    <ErrorMessage :error="styleError" />
    <div class="styles-actions">
      <PSButton
        class="save-button"
        :text="t('save')"
        :secondary="true"
        background="#451dd6"
        @click.stop="validateAndSave"
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
import { computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ErrorMessage, PSButton } from '@pubstudio/frontend/ui-widgets'
import { setComponentEditStyle } from '@pubstudio/frontend/feature-editor'
import { Css, IStyleEntry } from '@pubstudio/shared/type-site'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import EditMenuTitle from './EditMenuTitle.vue'
import MenuRow from './MenuRow.vue'
import StyleRow from './StyleRow.vue'
import { validateCssValue } from '../lib/validate-css-value'
import { useBuild } from '../lib/use-build'
import { useReusableStyleMenu } from '../lib/use-reusable-style-menu'

const { t } = useI18n()

const {
  editingStyle,
  styleError,
  clearEditingState,
  newEditingStyleProp,
  updateEditingStyleProp,
  removeEditingStyleProp,
  saveStyle,
} = useReusableStyleMenu()

const { editor, currentPseudoClass } = useBuild()

const editing = (propName: string) => {
  return editor.value?.componentTab.editStyle === propName
}

const editStyle = (propName: string | undefined) => {
  setComponentEditStyle(editor.value, propName)
}

const updateStyle = (index: number, entry: IStyleEntry) => {
  updateEditingStyleProp(index, entry)
  setComponentEditStyle(editor.value, undefined)
}

const removeStyle = (index: number) => {
  removeEditingStyleProp(index)
  setComponentEditStyle(editor.value, undefined)
}

const menuSubTitle = computed(() => `(${currentPseudoClass.value})`)

const editingStyleEntries = computed(() => {
  const entries =
    editingStyle.breakpoints[activeBreakpoint.value.id]?.[currentPseudoClass.value]
  return (entries ?? []).filter(
    (entry) =>
      // Entry with Css.Empty as property is created after clicking the add button
      entry.pseudoClass === currentPseudoClass.value || entry.property === Css.Empty,
  )
})

const validateAndSave = () => {
  const allValuesValid = editingStyleEntries.value.every((style) =>
    validateCssValue(style.property, style.value),
  )
  if (allValuesValid) {
    saveStyle()
  }
}

onUnmounted(() => {
  setComponentEditStyle(editor.value, undefined)
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.style-menu-edit {
  .styles-actions {
    @mixin menu-actions;
  }
}
</style>
