<template>
  <Modal :show="show" cls="export-modal" @cancel="emit('cancel')">
    <div class="modal-title">
      {{ t('file.export_title') }}
    </div>
    <div class="modal-text">
      {{ t('file.export_text') }}
    </div>
    <div class="export-types">
      <label v-for="data in exportTypes" :key="data.type" class="export-type">
        <input
          v-model="exportType"
          type="radio"
          name="export-radio"
          :value="data.type"
          @input="updateName(data.type)"
        />
        {{ data.label }}
      </label>
    </div>
    <PSInput
      v-model="fileName"
      name="export"
      class="export-filename"
      :placeholder="t('enter')"
      @keydown.enter="exportSite"
    />
    <div class="modal-buttons">
      <PSButton class="confirm-button" :text="t('confirm')" @click="exportSite" />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        variant="secondary"
        @click="emit('cancel')"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'petite-vue-i18n'
import { ExportOptions } from '@pubstudio/frontend/type-ui-widgets'
import { getPreviewLink } from '@pubstudio/frontend/util-site'
import { saveSite } from '@pubstudio/frontend/util-doc-site'
import { ISite } from '@pubstudio/shared/type-site'
import Modal from './Modal.vue'
import PSInput from '../form/PSInput.vue'
import PSButton from '../form/PSButton.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const props = defineProps<{
  site: ISite
  show: boolean
  defaultFileName: string
}>()
const { site, defaultFileName } = toRefs(props)

const emit = defineEmits<{
  (e: 'confirmExport'): void
  (e: 'cancel'): void
}>()

const fileName = ref('')
const exportType = ref(ExportOptions.PubStudio)

const exportTypes = [
  { label: t('file.export_types.pubstudio'), type: ExportOptions.PubStudio },
  { label: t('file.export_types.pdf'), type: ExportOptions.Pdf },
]

const updateName = (expType: ExportOptions) => {
  const nameArr = fileName.value.split('.')
  if (nameArr.length >= 2) {
    nameArr[nameArr.length - 1] = {
      [ExportOptions.PubStudio]: 'json',
      [ExportOptions.Pdf]: 'pdf',
    }[expType]
    fileName.value = nameArr.join('.')
  }
}

const exportSite = () => {
  if (exportType.value === ExportOptions.PubStudio) {
    saveSite(site.value, fileName.value)
  } else if (exportType.value === ExportOptions.Pdf) {
    const siteId = route.params.siteId ? route.params.siteId.toString() : ''
    const link = getPreviewLink(site.value, siteId, { action: 'print' })
    const routeData = router.resolve(link)
    window.open(routeData.href, '_blank')
  }
  emit('confirmExport')
}

onMounted(() => {
  fileName.value = defaultFileName.value
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.export-modal {
  .export-filename {
    margin-top: 16px;
  }
  .modal-buttons {
    .confirm-button {
      margin-right: 8px;
      min-width: 94px;
    }
    .cancel-button {
      margin-left: 8px;
    }
    .modal-text {
      margin: 24px 0;
    }
  }
  .export-types {
    @mixin flex-col;
    @mixin title-normal 14px;
    margin-top: 4px;
    color: black;
  }
  .export-type {
    margin-top: 6px;
    cursor: pointer;
  }
}
</style>
