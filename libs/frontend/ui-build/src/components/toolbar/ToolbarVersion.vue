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
      v-if="hasDraft && value === VersionOption.Draft"
      :tooltip="t('toolbar.publish')"
      class="toolbar-publish"
      @click="publishSite"
    >
      <Publish />
    </ToolbarItem>
    <ToolbarItem
      v-if="hasDraft && value === VersionOption.Draft"
      :tooltip="showPreview ? undefined : t('toolbar.link')"
      class="toolbar-link"
      @click="toggleShowPreview"
    >
      <Link />
    </ToolbarItem>
    <div v-if="loading" class="spinner-overlay">
      <Spinner />
    </div>
    <div class="disabled-alert" :class="{ active: siteSaveAlert }"></div>
    <div v-if="showPreview" class="preview-link-wrap">
      <div class="link-enable">
        <div class="preview-text">
          {{ t('toolbar.preview_link') }}
        </div>
        <PSToggle
          :on="!!site.preview_id"
          :onText="t('yes')"
          :offText="t('no')"
          class="preview-toggle"
          @toggle="setPreviewEnabled"
        />
      </div>
      <div v-if="site.preview_id" class="preview-link" @click="copyLink">
        <div class="preview-text">
          {{ t('copy_text') }}
        </div>
        <Link class="copy-link" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { setEditorDropdown } from '@pubstudio/frontend/data-access-command'
import { siteSaveAlert } from '@pubstudio/frontend/feature-site-store-init'
import {
  PSMultiselect,
  Link,
  PSToggle,
  Publish,
  Spinner,
  ToolbarItem,
  useToast,
} from '@pubstudio/frontend/ui-widgets'
import { EditorDropdown } from '@pubstudio/shared/type-site'
import { useSiteVersion, VersionOption } from '@pubstudio/frontend/feature-site-version'
import { IMultiselectObj } from '@pubstudio/frontend/type-ui-widgets'
import { copy } from '@pubstudio/frontend/util-doc'
import { WEB_URL } from '@pubstudio/frontend/util-config'
import { IMergedSiteData, useGetSite } from '@pubstudio/frontend/feature-sites'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { useClickaway } from '@pubstudio/frontend/util-clickaway'

const { t } = useI18n()
const { site, editor } = useBuild()
const {
  hasDraft,
  loading,
  hasVersions,
  sitePublished,
  activeVersionId,
  createDraft,
  publishSite,
  enablePreview,
  setActiveVersion,
} = useSiteVersion()
const { apiSiteId } = useSiteSource()
const { getSiteInfo } = useGetSite()
const { addToast } = useToast()

const siteData = ref<IMergedSiteData>()

useClickaway('.preview-link-wrap,.toolbar-link', () => {
  if (showPreview.value) {
    setEditorDropdown(editor.value, undefined)
  }
})

const showPreview = computed(() => {
  return editor.value?.editorDropdown === EditorDropdown.Preview
})

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

const setPreviewEnabled = async (enabled: boolean) => {
  enablePreview(enabled)
}

const toggleShowPreview = async () => {
  if (editor.value?.editorDropdown !== EditorDropdown.Preview) {
    setEditorDropdown(editor.value, EditorDropdown.Preview)

    if (!siteData.value && apiSiteId.value) {
      loading.value = true
      siteData.value = await getSiteInfo(apiSiteId.value)
      loading.value = false
    }
  } else {
    setEditorDropdown(editor.value, undefined)
  }
}

const copyLink = () => {
  const subdomain = siteData.value?.subdomain
  if (site.value.preview_id && subdomain) {
    copy(`https://${subdomain}.${WEB_URL}?p=${site.value.preview_id}`)
    addToast({ text: t('copied'), duration: 2500, id: 'preview-link-copied' })
    setEditorDropdown(editor.value, undefined)
  }
}

onMounted(() => {
  if (editor.value?.editorDropdown === EditorDropdown.Version || showPreview.value) {
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
  padding: 0 4px;
  z-index: $z-index-toolbar-dropdown2;
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
.preview-link-wrap {
  @mixin drop-shadow-4;
  padding: 6px 8px;
  position: absolute;
  top: 100%;
  background-color: white;
}
.link-enable {
  display: flex;
  align-items: center;
}
.preview-text {
  @mixin title-medium 13px;
  color: black;
  margin-right: 8px;
  flex-shrink: 0;
}
.preview-toggle {
  flex-shrink: 0;
}
.preview-link {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0 6px;
  cursor: pointer;
  .preview-text {
    color: $blue-500;
  }
}
.copy-link {
  @mixin size 18px;
}
</style>
