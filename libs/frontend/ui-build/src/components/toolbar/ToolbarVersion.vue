<template>
  <PSMultiselect
    v-if="hasVersions"
    :value="editor?.cssPseudoClass"
    class="toolbar-version"
    :placeholder="t('pseudo_class')"
    :options="options"
    :caret="false"
    :clearable="false"
    :tooltip="t('pseudo_class')"
    :openControl="() => editor?.editorDropdown === EditorDropdown.Version"
    @select="setVersion"
    @open="setEditorDropdown(editor, EditorDropdown.PseudoClass)"
    @close="setEditorDropdown(editor, undefined)"
    @click.stop
  />
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { setEditorDropdown } from '@pubstudio/frontend/util-command'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import { EditorDropdown } from '@pubstudio/shared/type-site'
import { useSiteVersion } from '@pubstudio/frontend/feature-site-version'

enum VersionOption {
  Unpublished = 'unpublished',
  Live = 'live',
  Draft = 'draft',
  Create = 'create',
}

const { t } = useI18n()
const { editor } = useBuild()
const { hasDraft, hasVersions, sitePublished } = useSiteVersion()

const options = computed(() => {
  if (hasDraft.value) {
    return [VersionOption.Live, VersionOption.Draft]
  }
  return sitePublished.value
    ? [VersionOption.Live, VersionOption.Create]
    : [VersionOption.Unpublished]
})

const setVersion = (version: VersionOption | undefined) => {
  if (version === VersionOption.Live) {
  } else if (version === VersionOption.Draft) {
  } else if (version === VersionOption.Create) {
  }
}

onMounted(() => {
  if (editor.value?.editorDropdown === EditorDropdown.Version) {
    setEditorDropdown(editor.value, undefined)
  }
})
</script>

<style lang="postcss" scoped>
.style-pseudo-class {
  width: 72px;
}
</style>
