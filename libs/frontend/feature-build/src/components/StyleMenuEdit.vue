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
      v-for="entry in editingStyleEntries"
      :key="`${entry.sourceBreakpointId}-${entry.property}`"
      :style="entry"
      :editing="!entry.property || editing(entry.property)"
      :inheritedFrom="getInheritedFrom(entry)"
      :focusProp="!entry.property"
      class="menu-row"
      @edit="editStyle"
      @update="updateStyle(entry.property, $event)"
      @remove="removeStyle(entry.property)"
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
import { Css, IInheritedStyleEntry, IStyleEntry } from '@pubstudio/shared/type-site'
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
  editingStyleEntries,
  styleError,
  clearEditingState,
  newEditingStyleProp,
  updateEditingStyleProp,
  removeEditingStyleProp,
  saveStyle,
} = useReusableStyleMenu()

const { site, editor, currentPseudoClass } = useBuild()

const editing = (propName: string) => {
  return editor.value?.componentTab.editStyle === propName
}

const editStyle = (propName: string | undefined) => {
  setComponentEditStyle(editor.value, propName)
}

const updateStyle = (property: Css, entry: IStyleEntry) => {
  updateEditingStyleProp(property, entry)
  setComponentEditStyle(editor.value, undefined)
}

const removeStyle = (property: Css) => {
  removeEditingStyleProp(property)
  setComponentEditStyle(editor.value, undefined)
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
