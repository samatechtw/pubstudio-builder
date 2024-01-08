<template>
  <div class="style-menu-edit" @keydown.esc.stop.prevent="saveMixinName">
    <MenuRowEdit
      :label="t('name')"
      :modelValue="editingName"
      class="name"
      @update:modelValue="editingName = $event || ''"
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
        @click.stop="saveMixinName"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ErrorMessage, PSButton } from '@pubstudio/frontend/ui-widgets'
import { useBuild, useReusableStyleMenu } from '@pubstudio/frontend/feature-build'
import { editStylesCancelEdit } from '@pubstudio/frontend/util-command'
import EditMenuTitle from './EditMenuTitle.vue'
import MenuRowEdit from './MenuRowEdit.vue'
import { StyleRow } from '..'

const { t } = useI18n()

const {
  editingName,
  styleEntries,
  styleError,
  isEditing,
  createStyle,
  editStyle,
  saveStyle,
  nonInheritedProperties,
  saveMixinName,
  removeStyle,
  setProperty,
  setValue,
} = useReusableStyleMenu()

const { site, currentPseudoClass } = useBuild()

const menuSubTitle = computed(() => `(${currentPseudoClass.value})`)

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
