<template>
  <div class="build-menu-wrap">
    <div class="build-menu" :class="{ expanded: !!editor?.buildSubmenu }">
      <BuildMenuIcon
        id="build-new"
        :text="t('new')"
        @click="toggleSubMenu(BuildSubmenu.New)"
      >
        <BuildNew />
      </BuildMenuIcon>
      <BuildMenuIcon
        id="build-custom"
        :text="t('build.custom_components')"
        @dragover="customDragover"
        @click="toggleSubMenu(BuildSubmenu.Custom)"
      >
        <Custom />
      </BuildMenuIcon>
      <BuildMenuIcon
        id="build-page"
        :text="t('build.pages')"
        @click="toggleSubMenu(BuildSubmenu.Page)"
      >
        <Pages />
      </BuildMenuIcon>
      <BuildMenuIcon
        id="build-theme"
        :text="t('theme.title')"
        @click="emit('toggleThemeMenu')"
      >
        <Theme />
      </BuildMenuIcon>
      <BuildMenuIcon
        id="build-styles"
        :text="t('style.styles')"
        @click="emit('toggleStyleMenu')"
      >
        <Style></Style>
      </BuildMenuIcon>
      <!-- Only get sites when logged in, so /build/scratch doesn't need auth -->
      <BuildMenuIcon
        v-if="store.auth.loggedIn.value"
        id="build-asset"
        :text="t('build.assets')"
        @click="toggleSubMenu(BuildSubmenu.Asset)"
      >
        <Assets v-if="store.auth.loggedIn.value" />
      </BuildMenuIcon>
      <BuildMenuIcon
        v-if="store.auth.loggedIn.value"
        id="build-asset"
        :text="t('i18n.title')"
        @click="toggleTranslations"
      >
        <Text></Text>
      </BuildMenuIcon>
      <BuildMenuIcon
        id="build-behaviors"
        :text="t('build.behaviors')"
        @click="toggleSubMenu(BuildSubmenu.Behavior)"
      >
        <Code></Code>
      </BuildMenuIcon>
      <BuildMenuIcon
        id="build-custom-data"
        :text="t('build.custom_data')"
        @click="showCustomDataModal = true"
      >
        <DataTable></DataTable>
      </BuildMenuIcon>
      <BuildMenuIcon
        id="build-history"
        :text="t('build.history')"
        @click="toggleSubMenu(BuildSubmenu.History)"
      >
        <Command></Command>
      </BuildMenuIcon>
      <BuildMenuIcon
        id="build-file"
        :text="t('build.file')"
        @click="toggleSubMenu(BuildSubmenu.File)"
      >
        <File></File>
      </BuildMenuIcon>
    </div>
    <TranslationsModal :show="!!editor?.translations" />
    <CustomDataModal
      :show="showCustomDataModal || !!editor?.selectedTable"
      @cancel="showCustomDataModal = false"
    />
    <Transition name="submenu">
      <component
        :is="submenu"
        v-if="showSubmenu"
        class="submenu"
        @showCreate="emit('showCreateModal')"
        @showTemplates="emit('showTemplateModal')"
      />
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useBuild } from '@pubstudio/frontend/feature-build'
import {
  setBuildSubmenu,
  showTranslations,
} from '@pubstudio/frontend/data-access-command'
import { store } from '@pubstudio/frontend/data-access-web-store'
import {
  Assets,
  BuildNew,
  Command,
  Custom,
  Pages,
  Text,
  Code,
  DataTable,
  Theme,
  Style,
  File,
} from '@pubstudio/frontend/ui-widgets'
import { TranslationsModal } from '@pubstudio/frontend/feature-site-translations'
import { BuildSubmenu } from '@pubstudio/shared/type-site'
import { dragSource } from '@pubstudio/frontend/feature-render-builder'
import { CustomDataModal } from '@pubstudio/frontend/feature-custom-data'
import { canBecomeCustom } from '@pubstudio/frontend/util-component'
import BuildMenuIcon from './BuildMenuIcon.vue'
import BuildMenuNew from './BuildMenuNew.vue'
import BuildMenuCustom from './BuildMenuCustom.vue'
import BuildMenuPage from './BuildMenuPage.vue'
import BuildMenuFile from './BuildMenuFile.vue'
import BuildMenuAsset from './BuildMenuAsset.vue'
import BuildMenuBehavior from './BuildMenuBehavior.vue'
import BuildMenuHistory from './BuildMenuHistory.vue'

const { t } = useI18n()
const { site, editor } = useBuild()

const emit = defineEmits<{
  (e: 'toggleStyleMenu', show?: boolean): void
  (e: 'toggleThemeMenu', show?: boolean): void
  (e: 'showCreateModal'): void
  (e: 'showTemplateModal'): void
}>()

const submenu = computed(() => {
  const menus = {
    [BuildSubmenu.Asset]: BuildMenuAsset,
    [BuildSubmenu.New]: BuildMenuNew,
    [BuildSubmenu.Custom]: BuildMenuCustom,
    [BuildSubmenu.Page]: BuildMenuPage,
    [BuildSubmenu.Behavior]: BuildMenuBehavior,
    [BuildSubmenu.History]: BuildMenuHistory,
    [BuildSubmenu.File]: BuildMenuFile,
  }
  const submenu = editor.value?.buildSubmenu
  return submenu ? menus[submenu] : undefined
})

const toggleTranslations = () => {
  showTranslations(editor.value, !editor.value?.translations)
}

const toggleSubMenu = (newSubmenu: BuildSubmenu) => {
  const submenu = editor.value?.buildSubmenu
  setBuildSubmenu(editor.value, submenu === newSubmenu ? undefined : newSubmenu)
}

const customDragover = (_e: DragEvent) => {
  const { context } = site.value
  if (canBecomeCustom(context, dragSource.value?.componentId)) {
    setBuildSubmenu(editor.value, BuildSubmenu.Custom)
  }
}

const showSubmenu = computed(() => {
  const { buildSubmenu } = editor.value ?? {}
  if (buildSubmenu === BuildSubmenu.New) {
    // Only show the new component menu when no new
    // component is being dragged.
    return !dragSource.value?.addData
  } else {
    return !!buildSubmenu
  }
})

const showCustomDataModal = ref(false)
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.build-menu-wrap {
  @mixin flex-row;
  position: relative;
  background-color: $color-toolbar-bg;
}
.build-menu {
  @mixin flex-col;
  background-color: $color-toolbar-bg;
  max-height: $view-height;
  overflow-y: scroll;
  height: 100%;
  width: $build-menu-width;
  padding-bottom: 8px;
  overflow: visible;
  overflow-y: scroll;
  align-items: center;
  z-index: 2;
  > div {
    margin-top: 24px;
  }
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.submenu {
  position: absolute;
  top: 0;
  left: $build-menu-width;
  z-index: 1;
}

.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.2s ease;
}

.submenu-enter-from,
.submenu-leave-to {
  transform: translateX(-200px);
}
</style>
