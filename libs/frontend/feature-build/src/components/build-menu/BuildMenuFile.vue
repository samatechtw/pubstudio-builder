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
      :text="t('templates')"
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
    <ExportModal
      :show="showExport"
      :defaultFileName="defaultFileName"
      @confirmExport="exportSite"
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
      @confirm="confirmImport"
      @cancel="pendingSiteImport = undefined"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { Export, Import } from '@pubstudio/frontend/ui-widgets'
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
  saveSite,
  validateSite,
} from '@pubstudio/frontend/util-site-store'
import { loadFile } from '@pubstudio/frontend/util-doc'
import { UserType } from '@pubstudio/shared/type-api-platform-user'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { ISerializedSite } from '@pubstudio/shared/type-site'
import { useBuild } from '../../lib/use-build'
import BuildMenuIconText from './BuildMenuIconText.vue'

const { t } = useI18n()
const { site, replaceSite } = useBuild()

const emit = defineEmits<{
  (e: 'showTemplates'): void
}>()

const showExport = ref(false)
const storedTemplate = ref<ISerializedSite>()
const pendingSiteImport = ref()
const parseError = ref()

const defaultFileName = computed(() => defaultExportedFileName(site.value.name))

const exportSite = (fileName: string) => {
  saveSite(site.value, fileName)
  showExport.value = false
}

const confirmImport = () => {
  replaceSite(pendingSiteImport.value)
  pendingSiteImport.value = undefined
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
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.file-menu {
  @mixin flex-col;
  height: 100%;
  width: 80px;
  padding-top: 32px;
  background-color: white;
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
