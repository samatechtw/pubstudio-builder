<template>
  <div class="style-menu-edit" @keydown.esc.stop.prevent="escPress">
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
      v-for="entry in editingStyleEntries"
      :key="`${entry.sourceBreakpointId}-${entry.property}`"
      :style="entry"
      :editing="!entry.property || editing(entry.property)"
      :inheritedFrom="getInheritedFrom(entry)"
      :focusProp="!entry.property"
      class="menu-row"
      @edit="editStyle"
      @update="updateEditData(entry.property, $event)"
      @save="saveStyle(entry)"
      @remove="removeStyle(entry.property)"
      @escape="cancelEdit(entry.property, $event)"
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
import { useI18n } from 'petite-vue-i18n'
import { ErrorMessage, PSButton } from '@pubstudio/frontend/ui-widgets'
import {
  clearComponentEditStyle,
  clearAllEditStyles,
  setComponentEditStyle,
} from '@pubstudio/frontend/feature-editor'
import { Css, IInheritedStyleEntry, IStyleEntry } from '@pubstudio/shared/type-site'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import {
  useBuild,
  validateCssValue,
  useReusableStyleMenu,
} from '@pubstudio/frontend/feature-build'
import EditMenuTitle from './EditMenuTitle.vue'
import MenuRow from './MenuRow.vue'
import StyleRow from './StyleRow.vue'

const { t } = useI18n()

const {
  editing: editingMenu,
  editingStyle,
  editingStyleEntries,
  styleError,
  clearEditingState,
  newEditingStyleProp,
  updateEditingStyleProp,
  removeEditingStyleProp,
  saveStyle: saveReusableStyle,
} = useReusableStyleMenu()

const { site, editor, currentPseudoClass } = useBuild()

const editing = (propName: string) => {
  return editor.value?.editStyles.has(propName)
}

const escPress = () => {
  editingMenu.value = false
}

const cancelEdit = (property: Css, originalStyle: IStyleEntry) => {
  updateEditingStyleProp(property, originalStyle)
  clearComponentEditStyle(editor.value, property)
}

const editStyle = (propName: string) => {
  setComponentEditStyle(editor.value, propName as Css)
}

const updateEditData = (property: Css, entry: IStyleEntry) => {
  updateEditingStyleProp(property, entry)
  setComponentEditStyle(editor.value, entry.property)
}

const saveStyle = (entry: IStyleEntry) => {
  updateEditingStyleProp(property, entry)
  clearComponentEditStyle(editor.value, property)
}

const removeStyle = (property: Css) => {
  removeEditingStyleProp(property)
  clearComponentEditStyle(editor.value, property)
}

const menuSubTitle = computed(() => `(${currentPseudoClass.value})`)

const getInheritedFrom = (entry: IInheritedStyleEntry): string | undefined => {
  if (entry.sourceBreakpointId !== activeBreakpoint.value.id) {
    return t('style.inherited_breakpoint', {
      breakpoint: site.value.context.breakpoints[entry.sourceBreakpointId]?.name,
    })
  } else {
    return undefined
  }
}

const validateAndSave = () => {
  const allValuesValid = editingStyleEntries.value.every((style) =>
    validateCssValue(site.value.context, style.property, style.value),
  )
  if (allValuesValid) {
    saveReusableStyle()
  }
}

onUnmounted(() => {
  clearAllEditStyles(editor.value)
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.styles-actions {
  @mixin menu-actions;
}
</style>
