<template>
  <div class="style-toolbar">
    <ToolbarItem
      :active="editor?.showComponentTree"
      :tooltip="t('toolbar.component_tree')"
      class="toolbar-tree"
      @click="toggleComponentTree"
    >
      <Hierarchy />
    </ToolbarItem>
    <ToolbarItem
      :tooltip="t('toolbar.undo')"
      :disabled="!canUndo"
      :alert="commandAlert === CommandType.Undo"
      class="toolbar-undo"
      @click="undo()"
    >
      <Undo />
    </ToolbarItem>
    <ToolbarItem
      :tooltip="t('toolbar.redo')"
      :disabled="!canRedo"
      :alert="commandAlert === CommandType.Redo"
      @click="redo()"
    >
      <Redo />
    </ToolbarItem>
    <ToolbarPage class="toolbar-page" />
    <ToolbarBreakpoint class="toolbar-breakpoint" />
    <ToolbarVersion />
    <ToolbarPseudoClass class="toolbar-pseudo-class" />
    <ToolbarBuilderWidth />
    <ToolbarItem
      :tooltip="isSaving ? t('build.preview_saving') : t('build.preview')"
      :disabled="isSaving"
      class="preview-link"
    >
      <slot name="preview" />
    </ToolbarItem>
    <ToolbarItem
      :active="editor?.debugBounding"
      :tooltip="t('toolbar.bounding')"
      class="bounding"
      @click="setDebugBounding(editor, !editor?.debugBounding)"
    >
      <BoundingBox />
    </ToolbarItem>
    <ToolbarItem
      :tooltip="t('toolbar.bug_title')"
      class="bounding"
      @click="setShowBugReportModal(true)"
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
    <ToolbarItem :tooltip="t(`toolbar.save.${siteStore.saveState}`)">
      <div class="save-state" :class="siteStore.saveState" @click="forceSave" />
    </ToolbarItem>
    <BugReportModal :show="showBugReportModal" @cancel="setShowBugReportModal(false)" />
  </div>
</template>

<script lang="ts" setup>
import { ref, unref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useBuild, useHistory } from '@pubstudio/frontend/feature-build'
import {
  setDebugBounding,
  setShowComponentTree,
} from '@pubstudio/frontend/data-access-command'
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
import ToolbarPage from './ToolbarPage.vue'
import ToolbarPseudoClass from './ToolbarPseudoClass.vue'
import ToolbarBuilderWidth from './ToolbarBuilderWidth.vue'
import ToolbarBreakpoint from './ToolbarBreakpoint.vue'
import BugReportModal from './BugReportModal.vue'
import ToolbarVersion from './ToolbarVersion.vue'
import { SiteSaveState } from '@pubstudio/shared/type-site'

defineProps<{
  hideSettings?: boolean
}>()
const emit = defineEmits<{
  (e: 'showSiteSettings'): void
}>()

const { t } = useI18n()

const { site, commandAlert, editor } = useBuild()
const { siteStore, isSaving } = useSiteSource()
const { canUndo, canRedo, undo, redo } = useHistory()
const { apiSiteId } = useSiteSource()
const showBugReportModal = ref(false)

const toggleComponentTree = () => {
  if (editor.value) {
    const show = !!editor.value.showComponentTree
    setShowComponentTree(editor.value, !show)
  }
}

const setShowBugReportModal = (show: boolean) => {
  showBugReportModal.value = show
}

const forceSave = async () => {
  if (unref(siteStore.value.saveState) !== SiteSaveState.Saved) {
    await siteStore.value.save(site.value, {
      immediate: true,
      ignoreUpdateKey: true,
      forceUpdate: true,
    })
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
  height: calc($site-toolbar-height - 2px);
}
:deep(.ps-multiselect .dropdown) {
  z-index: $z-index-site-toolbar;
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
