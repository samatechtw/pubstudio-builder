<template>
  <div class="file-menu">
    <BuildMenuIconText :text="t('file.export')" @click="showExport = true">
      <Export></Export>
    </BuildMenuIconText>
    <SimpleFileUpload id="import" class="import" @selectFile="importSite">
      <BuildMenuIconText :text="t('import')">
        <Import></Import>
      </BuildMenuIconText>
    </SimpleFileUpload>
    <BuildMenuIconText
      :text="t('template.title')"
      class="templates"
      @click="emit('showTemplates')"
    >
      <Templates></Templates>
    </BuildMenuIconText>
    <BuildMenuIconText
      v-if="store.user.isAdmin"
      :text="t('template.create')"
      @click="showTemplateModal"
    >
      <Templates></Templates>
    </BuildMenuIconText>
    <SaveTemplateModal :template="storedTemplate" @cancel="storedTemplate = undefined" />
    <BuildMenuIconText :text="t('build.reset')" @click="showConfirmReset = true">
      <Trash color="#b7436a" />
    </BuildMenuIconText>
    <ExportModal
      :site="site"
      :show="showExport"
      :defaultFileName="defaultFileName"
      @confirmExport="showExport = false"
      @cancel="showExport = false"
    />
    <AlertModal
      :show="!!parseError"
      :title="t('build.import_error')"
      :text="parseError"
      @done="parseError = undefined"
    />
    <ConfirmModal
      :show="!!pendingSiteImport"
      :title="t('build.confirm_import')"
      :text="t('build.confirm_import_text')"
      :loading="importing"
      @confirm="confirmImport"
      @cancel="pendingSiteImport = undefined"
    />
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
import { store } from '@pubstudio/frontend/data-access-web-store'
import { Export, Import, Trash } from '@pubstudio/frontend/ui-widgets'
import {
  ExportModal,
  AlertModal,
  ConfirmModal,
  SimpleFileUpload,
  SaveTemplateModal,
  Templates,
} from '@pubstudio/frontend/ui-widgets'
import { serializeSite } from '@pubstudio/frontend/util-site-store'
import {
  defaultExportedFileName,
  validateSite,
} from '@pubstudio/frontend/util-site-store'
import { loadFile } from '@pubstudio/frontend/util-doc'
import {
  deserializeSite,
  replaceNamespace,
} from '@pubstudio/frontend/util-site-deserialize'
import { ISerializedSite } from '@pubstudio/shared/type-site'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { makeNamespace } from '@pubstudio/frontend/data-access-command'
import BuildMenuIconText from './BuildMenuIconText.vue'

const { t } = useI18n()
const { site, replaceSite, resetSite } = useBuild()

const emit = defineEmits<{
  (e: 'showTemplates'): void
}>()

const showExport = ref(false)
const storedTemplate = ref<ISerializedSite>()
const pendingSiteImport = ref()
const parseError = ref()
const showConfirmReset = ref(false)
const importing = ref(false)

const defaultFileName = computed(() => defaultExportedFileName(site.value.name))

const confirmImport = async () => {
  importing.value = true
  const namespace = makeNamespace(site.value.context.namespace)
  await replaceSite(replaceNamespace(pendingSiteImport.value, namespace))
  pendingSiteImport.value = undefined
  importing.value = false
}

const importSite = async (file: File) => {
  const siteString = await loadFile(file)
  if (siteString) {
    const site = deserializeSite(siteString)
    if (site) {
      parseError.value = validateSite(site)
      if (!parseError.value) {
        pendingSiteImport.value = site
        return
      }
    }
  }
  parseError.value = 'Failed to parse site data from file.'
}

const showTemplateModal = () => {
  storedTemplate.value = serializeSite(site.value)
}

const resetConfirmed = () => {
  resetSite()
  showConfirmReset.value = false
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.file-menu {
  @mixin flex-col;
  height: 100%;
  width: 80px;
  padding-top: 24px;
  background-color: $blue-100;
  box-shadow: $file-menu-shadow;
  align-items: center;
  > div:not(:first-child) {
    margin-top: 24px;
  }
}
.import {
  border: none;
  &:hover {
    :deep(.text) {
      color: $color-toolbar-button-active;
    }
    :deep(svg) {
      path,
      circle {
        fill: $color-toolbar-button-active;
        stroke: $color-toolbar-button-active;
      }
    }
  }
}
</style>
