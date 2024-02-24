<template>
  <div class="toolbar-version-wrap">
    <PSMultiselect
      v-if="hasVersions"
      :value="value"
      :forceLabel="t(`toolbar.version.${value}`)"
      class="toolbar-version"
      :options="options"
      :caret="false"
      :clearable="false"
      :tooltip="tooltip"
      :openControl="() => editor?.editorDropdown === EditorDropdown.Version"
      @select="setVersion"
      @open="setEditorDropdown(editor, EditorDropdown.Version)"
      @close="setEditorDropdown(editor, undefined)"
      @click.stop
    />
    <ToolbarItem
      v-if="hasDraft"
      :tooltip="t('toolbar.publish')"
      class="toolbar-publish"
      @click="publishSite"
    >
      <Publish />
    </ToolbarItem>
    <div v-if="loading" class="spinner-overlay">
      <Spinner />
    </div>
    <div class="disabled-alert" :class="{ active: siteSaveAlert }"></div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { setEditorDropdown } from '@pubstudio/frontend/data-access-command'
import { siteSaveAlert } from '@pubstudio/frontend/feature-site-store-init'
import {
  PSMultiselect,
  Publish,
  Spinner,
  ToolbarItem,
} from '@pubstudio/frontend/ui-widgets'
import { EditorDropdown } from '@pubstudio/shared/type-site'
import { useSiteVersion, VersionOption } from '@pubstudio/frontend/feature-site-version'
import { IMultiselectObj } from '@pubstudio/frontend/type-ui-widgets'

const { t } = useI18n()
const { editor } = useBuild()
const {
  hasDraft,
  loading,
  hasVersions,
  sitePublished,
  activeVersionId,
  createDraft,
  publishSite,
  setActiveVersion,
} = useSiteVersion()

const makeOptions = (versions: VersionOption[]) => {
  return versions
    .filter((v) => v !== value.value)
    .map((v) => ({ value: v, label: t(`toolbar.version.${v}`) }))
}

const options = computed(() => {
  let options: VersionOption[]
  if (hasDraft.value) {
    options = [VersionOption.Live, VersionOption.Draft]
  } else {
    options = sitePublished.value
      ? [VersionOption.Live, VersionOption.Create]
      : [VersionOption.Unpublished]
  }
  return makeOptions(options)
})

const value = computed(() => {
  if (hasDraft.value) {
    return activeVersionId.value ? VersionOption.Live : VersionOption.Draft
  }
  return VersionOption.Live
})

const tooltip = computed(() => {
  if (hasDraft.value) {
    return activeVersionId.value ? t('toolbar.live') : t('toolbar.draft')
  }
  return t('toolbar.no_draft')
})

const setVersion = async (opt: IMultiselectObj | undefined) => {
  const version = opt?.value
  if (version === VersionOption.Live || version === VersionOption.Draft) {
    setActiveVersion(version)
  } else if (version === VersionOption.Create || version === VersionOption.Unpublished) {
    await createDraft()
  }
}

onMounted(() => {
  if (editor.value?.editorDropdown === EditorDropdown.Version) {
    setEditorDropdown(editor.value, undefined)
  }
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.toolbar-version-wrap {
  display: flex;
  position: relative;
  align-items: center;
}
.spinner-overlay {
  @mixin overlay;
  @mixin flex-center;
  background-color: rgba(0, 0, 0, 0.3);
}
.disabled-alert {
  @mixin overlay;
  pointer-events: none;
  animation-timing-function: ease-out;
  opacity: 0;
  &.active {
    animation: disable-flash 1.4s;
  }
}
@keyframes disable-flash {
  0% {
    background: $blue-500;
    opacity: 1;
  }
  100% {
    background: none;
  }
}
.toolbar-version {
  width: 94px;
}
</style>
