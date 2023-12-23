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
    <ChildStyleRow
      v-for="entry in editingStyleEntries"
      :key="`${entry.sourceBreakpointId}-${entry.property}`"
      :style="entry"
      :editing="!entry.property || editing(entry.property)"
      :focusProp="!entry.property"
      class="menu-row"
      @edit="editStyle"
      @update="updateEditData(entry.property, $event)"
      @save="saveStyle(entry.property, $event)"
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
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ErrorMessage, PSButton } from '@pubstudio/frontend/ui-widgets'
import { Css, IStyleEntry } from '@pubstudio/shared/type-site'
import {
  useBuild,
  validateCssValue,
  useReusableStyleMenu,
} from '@pubstudio/frontend/feature-build'
import EditMenuTitle from './EditMenuTitle.vue'
import MenuRow from './MenuRow.vue'
import ChildStyleRow from './component-menu/ChildStyleRow.vue'

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

const { site, currentPseudoClass } = useBuild()

const editingProp = ref<string | undefined>()

const editing = (propName: string) => {
  return editingProp.value === propName
}

const escPress = () => {
  editingMenu.value = false
}

const cancelEdit = (property: Css, originalStyle: IStyleEntry) => {
  updateEditingStyleProp(property, originalStyle)
  editingProp.value = undefined
}

const editStyle = (propName: string | undefined) => {
  editingProp.value = propName
}

const updateEditData = (property: Css, entry: IStyleEntry) => {
  updateEditingStyleProp(property, entry)
  editingProp.value = entry.property
}

const saveStyle = (property: Css, entry: IStyleEntry) => {
  updateEditingStyleProp(property, entry)
  editingProp.value = undefined
}

const removeStyle = (property: Css) => {
  removeEditingStyleProp(property)
  editingProp.value = undefined
}

const menuSubTitle = computed(() => `(${currentPseudoClass.value})`)

const validateAndSave = () => {
  const allValuesValid = editingStyleEntries.value.every((style) =>
    validateCssValue(site.value.context, style.property, style.value),
  )
  if (allValuesValid) {
    saveReusableStyle()
  }
}

onUnmounted(() => {
  editingProp.value = undefined
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.styles-actions {
  @mixin menu-actions;
}
</style>
