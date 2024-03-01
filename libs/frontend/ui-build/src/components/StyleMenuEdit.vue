<template>
  <div class="style-menu-edit" @keydown.esc.stop.prevent="handleEsc">
    <MenuRowEdit
      :label="t('name')"
      :modelValue="editingStyle?.name"
      class="name"
      @update:modelValue="setMixinName($event || '')"
    />
    <EditMenuTitle
      :title="t('style.styles')"
      :subTitle="menuSubTitle"
      @add="createStyle"
    />
    <StyleRow
      v-for="entry in styleEntries"
      :key="`m-${entry.property}`"
      :style="entry"
      :editing="isEditing(entry.property)"
      :focusProp="!entry.property"
      :omitEditProperties="nonInheritedProperties"
      class="menu-row"
      @setProperty="setProperty(entry, $event)"
      @setValue="setValue(entry, $event)"
      @edit="editStyle(entry.property)"
      @save="saveStyle(entry.property)"
      @remove="removeStyle(entry)"
    />
    <ErrorMessage :error="styleError" />
    <div class="styles-actions">
      <PSButton
        class="ok-button"
        :text="t('ok')"
        :secondary="true"
        size="small"
        background="#451dd6"
        @click.stop="saveMixinStyles"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ErrorMessage, PSButton } from '@pubstudio/frontend/ui-widgets'
import { useBuild, useReusableStyleMenu } from '@pubstudio/frontend/feature-build'
import {
  editStylesCancelEdit,
  isEditingStyles,
} from '@pubstudio/frontend/data-access-command'
import EditMenuTitle from './EditMenuTitle.vue'
import MenuRowEdit from './MenuRowEdit.vue'
import StyleRow from './StyleRow.vue'

const { t } = useI18n()

const {
  styleEntries,
  styleError,
  editingStyle,
  isEditing,
  createStyle,
  editStyle,
  saveStyle,
  nonInheritedProperties,
  setMixinName,
  saveMixinStyles,
  removeStyle,
  setProperty,
  setValue,
} = useReusableStyleMenu()

const { site, currentPseudoClass } = useBuild()

const menuSubTitle = computed(() => `(${currentPseudoClass.value})`)

const handleEsc = () => {
  if (!isEditingStyles()) {
    saveMixinStyles()
  }
}

onUnmounted(() => {
  editStylesCancelEdit(site.value)
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.styles-actions {
  @mixin menu-actions;
}
</style>
