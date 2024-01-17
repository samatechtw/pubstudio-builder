<template>
  <div v-if="site" class="build-wrap">
    <div class="style-toolbar-wrap">
      <StyleToolbar />
    </div>
    <div class="build">
      <BuildMenu
        @toggleStyleMenu="toggleEditorMenu(editor, EditorMode.Styles, $event)"
        @toggleThemeMenu="toggleEditorMenu(editor, EditorMode.Theme, $event)"
        @showCreateModal="showCreateModal = true"
      />
      <ComponentTree />
      <BuildContent />
      <div class="build-right-menu">
        <Transition name="fade">
          <ComponentMenu
            v-if="showComponentMenu"
            :component="editor?.selectedComponent!"
            :siteId="siteId ?? ''"
            class="build-right-menu-content"
          />
          <ThemeMenu
            v-else-if="editor?.mode === EditorMode.Theme"
            class="build-right-menu-content"
          />
          <StyleMenu
            v-else-if="editor?.mode === EditorMode.Styles"
            class="build-right-menu-content"
          />
          <PageMenu
            v-else-if="editor?.mode === EditorMode.Page"
            class="build-right-menu-content"
          />
          <div v-else class="build-right-menu-empty">
            {{ t('build.menu_empty') }}
          </div>
        </Transition>
      </div>
      <!-- TODO -- decouple from platform API
      <CreateAssetModal
        :show="showCreateModal"
        :sites="sites"
        :initialSiteId="apiSiteId"
        :initialFile="droppedFile?.file"
        :loadSites="true"
        @complete="showCreateComplete"
        @cancel="showCreateCancel"
      />
      -->
      <AlertModal
        :show="siteError === 'errors.Unauthorized'"
        :title="t('errors.unauthorized_title')"
        :text="t('errors.Unauthorized')"
        @done="siteError = undefined"
      />
      <AlertModal
        v-if="apiSiteId === 'scratch'"
        :show="!store.misc.scratchPopupViewed.value"
        :title="t('build.scratch_title')"
        :text="t('build.scratch_text')"
        @done="store.misc.setScratchPopupViewed(true)"
      />
      <SiteErrorModal
        :show="!!siteError && siteError !== 'errors.Unauthorized' && showSiteErrorModal"
        :siteId="apiSiteId ?? ''"
        :siteError="siteError ?? ''"
        :showSupport="false"
        @cancel="showSiteErrorModal = false"
      />
    </div>
    <SiteSaveErrorModal />
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { store } from '@pubstudio/frontend/data-access-web-store'
import {
  AlertModal,
  SiteErrorModal,
  SiteSaveErrorModal,
} from '@pubstudio/frontend/ui-widgets'
import {
  BuildContent,
  BuildMenu,
  StyleMenu,
  ComponentMenu,
  ComponentTree,
  ThemeMenu,
  PageMenu,
  StyleToolbar,
} from '@pubstudio/frontend/ui-build'
import { useBuild, useHistory } from '@pubstudio/frontend/feature-build'
import { toggleEditorMenu } from '@pubstudio/frontend/util-command'
import { useDragDropData } from '@pubstudio/frontend/feature-render-builder'
import { useBuildEvent, hotkeysDisabled } from '@pubstudio/frontend/feature-build-event'
import { Keys, useKeyListener } from '@pubstudio/frontend/util-key-listener'
import { EditorMode } from '@pubstudio/shared/type-site'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { initializeSiteStore } from '@pubstudio/frontend/feature-site-store-init'
import { SITE_ID, SITE_API_URL } from '@pubstudio/frontend/util-config'

const { t } = useI18n()

const { site, editor, siteError } = useBuild()
const showSiteErrorModal = ref(true)
const { droppedFile } = useDragDropData()

const siteId = SITE_ID || 'scratch'
const { siteStore, apiSiteId, isSaving } = useSiteSource()
await initializeSiteStore({ siteId, apiSiteUrl: SITE_API_URL })
useBuildEvent()
const { undo, redo } = useHistory()

const showCreateModal = ref(false)

watch(droppedFile, (newVal) => {
  if (newVal) {
    showCreateModal.value = true
  }
})

/*
const showCreateComplete = (asset: ICreatePlatformSiteAssetResponse) => {
  if (droppedFile.value && activePage.value) {
    const addImageData = makeAddImageData(site.value, activePage.value.root, urlFromAsset(asset))
    if (addImageData) {
      addComponentData({
        ...addImageData,
        parentId: droppedFile.value.componentId,
        parentIndex: droppedFile.value.index,
      })
    }
  }
  droppedFile.value = undefined
  showCreateModal.value = false
}

const showCreateCancel = () => {
  showCreateModal.value = false
  droppedFile.value = undefined
}

const saveSiteBeforeLeave = () => {
  if (isSaving.value) {
    siteStore.value.save(site.value, { immediate: true })
  }
}
*/

// For debugging editor mode state
const showComponentMenu = computed(() => {
  return (
    editor.value?.mode === EditorMode.SelectedComponent &&
    !!editor.value?.selectedComponent
  )
})

useKeyListener(
  Keys.Z,
  (evt: KeyboardEvent) => {
    evt.stopImmediatePropagation()
    if (hotkeysDisabled(evt, editor.value)) {
      return
    }
    const isZ = evt.key === 'Z' || evt.key === 'z'
    if (isZ && (evt.ctrlKey || evt.metaKey) && evt.shiftKey) {
      redo(true)
    } else if (isZ && (evt.ctrlKey || evt.metaKey)) {
      undo(true)
    }
  },
  'keydown',
)

const beforeWindowUnload = (e: BeforeUnloadEvent) => {
  if (isSaving.value) {
    e.preventDefault()
    // Chrome requires returnValue to be set
    e.returnValue = t('build.unsaved')
    // Note: Most modern browsers no longer allow custom messages
    return e.returnValue
  } else {
    siteStore.value.save(site.value, { immediate: true })
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', beforeWindowUnload)
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeWindowUnload)
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.build-wrap {
  height: 100%;
}
.build {
  @mixin flex-row;
}
.build-right-menu {
  @mixin menu;
  height: auto;
  max-height: $view-height;
  position: relative;
  overflow: scroll;
  border-left: 1px solid $border1;
}
.build-right-menu-content {
  width: 100%;
}
.build-right-menu-empty {
  @mixin title-medium 20px;
  color: $grey-500;
  padding: 16px;
}
.style-toolbar-wrap {
  display: flex;
}
.home {
  @mixin flex-center;
  background-color: $purple-button;
  padding: 0 2px;
  width: 48px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
}
.fade-leave-to {
  position: absolute;
  padding: 0 24px;
  opacity: 0;
}
</style>
