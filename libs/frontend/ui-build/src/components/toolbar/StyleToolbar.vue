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
    <ToolbarPage class="toolbar-page" />
    <ToolbarBreakpoint class="toolbar-breakpoint" />
    <ToolbarPseudoClass class="toolbar-pseudo-class" />
    <ToolbarBuilderWidth class="toolbar-builder-width" />
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
    <ToolbarItem
      :tooltip="t('style.toolbar.bug_title')"
      class="bounding"
      @click="showBugReportModal = true"
    >
      <Bug />
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
    <BugReportModal :show="showBugReportModal" @cancel="showBugReportModal = false" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useBuild, useHistory } from '@pubstudio/frontend/feature-build'
import { prosemirrorEditing } from '@pubstudio/frontend/util-edit-text'
import { setDebugBounding, setShowComponentTree } from '@pubstudio/frontend/util-command'
import {
  BoundingBox,
  Bug,
  Redo,
  ToolbarItem,
  Undo,
  Hierarchy,
  Settings,
} from '@pubstudio/frontend/ui-widgets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { CommandType } from '@pubstudio/shared/type-command'
import ToolbarText from './ToolbarText.vue'
import ToolbarContainer from './ToolbarContainer.vue'
import ToolbarPage from './ToolbarPage.vue'
import ToolbarPseudoClass from './ToolbarPseudoClass.vue'
import ToolbarBuilderWidth from './ToolbarBuilderWidth.vue'
import ToolbarBreakpoint from './ToolbarBreakpoint.vue'
import BugReportModal from './BugReportModal.vue'

defineProps<{
  hideSettings?: boolean
}>()
const emit = defineEmits<{
  (e: 'showSiteSettings'): void
}>()

const { t } = useI18n()

const { commandAlert, editor } = useBuild()
const { siteStore, isSaving } = useSiteSource()
const { canUndo, canRedo, undo, redo } = useHistory()
const { apiSiteId } = useSiteSource()
const showBugReportModal = ref(false)

const showTextStyle = computed(() => {
  return (
    editor.value?.selectedComponent?.content !== undefined ||
    prosemirrorEditing(editor.value)
  )
})

const showContainer = computed(() => {
  return !!editor.value?.selectedComponent
})

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
}

:deep(.ps-input),
:deep(.multiselect),
:deep(.ps-multiselect) {
  height: calc($style-toolbar-height - 2px);
}
.toolbar-section {
  display: flex;
  align-items: center;
}
.toolbar-page {
  margin-left: auto;
  margin-right: 4px;
}
.toolbar-breakpoint {
  margin-left: auto;
  margin-right: auto;
}
.toolbar-pseudo-class {
  margin-left: 8px;
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
