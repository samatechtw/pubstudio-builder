<template>
  <div class="style-toolbar">
    <ToolbarItem
      :active="editor?.showComponentTree"
      :tooltip="t('style.toolbar.component_tree')"
      class="toolbar-tree"
      @click="toggleComponentTree"
    >
      <Hierarchy />
    </ToolbarItem>
    <ToolbarItem
      :tooltip="t('style.toolbar.undo')"
      :disabled="!canUndo"
      :alert="commandAlert === CommandType.Undo"
      class="toolbar-undo"
      @click="undo()"
    >
      <Undo />
    </ToolbarItem>
    <ToolbarItem
      :tooltip="t('style.toolbar.redo')"
      :disabled="!canRedo"
      :alert="commandAlert === CommandType.Redo"
      @click="redo()"
    >
      <Redo />
    </ToolbarItem>
    <ToolbarContainer :show="showContainer" class="toolbar-section" />
    <ToolbarText :show="showTextStyle" class="toolbar-section" />
    <ToolbarPseudoClass class="toolbar-pseudo-class" />
    <ToolbarBuilderWidth class="toolbar-builder-width" />
    <ToolbarBreakpoint class="toolbar-breakpoint" />
    <ToolbarItem
      :tooltip="isSaving ? t('build.preview_saving') : t('build.preview')"
      :disabled="isSaving"
      class="preview-link"
    >
      <slot name="preview" />
    </ToolbarItem>
    <ToolbarItem
      :active="editor?.debugBounding"
      :tooltip="t('style.toolbar.bounding')"
      class="bounding"
      @click="setDebugBounding(editor, !editor?.debugBounding)"
    >
      <BoundingBox />
    </ToolbarItem>
    <ToolbarItem :tooltip="t('style.toolbar.reset')">
      <Trash color="#b7436a" @click="showConfirmReset = true" />
    </ToolbarItem>
    <ToolbarItem
      v-if="!hideSettings && apiSiteId && apiSiteId !== 'scratch'"
      :tooltip="t('sites.settings')"
      @click="emit('showSiteSettings')"
    >
      <Settings />
    </ToolbarItem>
    <ToolbarItem :tooltip="t(`style.toolbar.save.${siteStore.saveState}`)">
      <div class="save-state" :class="siteStore.saveState" />
    </ToolbarItem>
    <ConfirmModal
      :show="showConfirmReset"
      :title="t('build.confirm_reset')"
      :text="t('build.confirm_reset_text')"
      @confirm="resetConfirmed"
      @cancel="showConfirmReset = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useBuild, useHistory } from '@pubstudio/frontend/feature-build'
import {
  setDebugBounding,
  setShowComponentTree,
} from '@pubstudio/frontend/feature-editor'
import {
  Redo,
  ToolbarItem,
  Trash,
  Undo,
  Hierarchy,
  Settings,
} from '@pubstudio/frontend/ui-widgets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { ConfirmModal } from '@pubstudio/frontend/ui-widgets'
import { BoundingBox } from '@pubstudio/frontend/ui-widgets'
import { CommandType } from '@pubstudio/shared/type-command'
import ToolbarText from './ToolbarText.vue'
import ToolbarContainer from './ToolbarContainer.vue'
import ToolbarPseudoClass from './ToolbarPseudoClass.vue'
import ToolbarBuilderWidth from './ToolbarBuilderWidth.vue'
import ToolbarBreakpoint from './ToolbarBreakpoint.vue'

defineProps<{
  hideSettings?: boolean
}>()
const emit = defineEmits<{
  (e: 'showSiteSettings'): void
}>()

const { t } = useI18n()

const { commandAlert, editor, resetSite } = useBuild()
const { siteStore, isSaving } = useSiteSource()
const { canUndo, canRedo, undo, redo } = useHistory()
const { apiSiteId } = useSiteSource()
const showConfirmReset = ref(false)

const showTextStyle = computed(() => {
  return !!editor.value?.selectedComponent?.content
})

const showContainer = computed(() => {
  return !!editor.value?.selectedComponent
})

const resetConfirmed = () => {
  resetSite()
  showConfirmReset.value = false
}

const toggleComponentTree = () => {
  if (editor.value) {
    const show = !!editor.value.showComponentTree
    setShowComponentTree(editor.value, !show)
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.style-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  padding: 0 24px 0 8px;
  background-color: $color-toolbar-bg;
  :deep(.ps-input),
  :deep(.multiselect),
  :deep(.ps-multiselect) {
    height: calc($style-toolbar-height - 2px);
  }
}
.toolbar-section {
  display: flex;
  align-items: center;
}
.toolbar-pseudo-class {
  margin-left: auto;
}
.save-state {
  @mixin size 14px;
  border-radius: 50%;
  margin: 0 auto;
  transition: background-color 0.25s ease;
  &.saved {
    background-color: $green-700;
  }
  &.saving,
  &.savingEditor {
    background-color: $grey-700;
  }
  &.error {
    background-color: $color-red;
  }
}
</style>