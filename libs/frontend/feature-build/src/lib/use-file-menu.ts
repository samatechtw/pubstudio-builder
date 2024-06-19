import { serializeSite } from '@pubstudio/frontend/util-site-store'
import { ISerializedSite, ISite } from '@pubstudio/shared/type-site'
import { ref } from 'vue'

export const showExport = ref(false)
export const showSelectTemplateModal = ref(false)
export const storedTemplate = ref<ISerializedSite>()

export const setShowExportModal = (show: boolean) => {
  showExport.value = show
}

export const showSaveTemplateModal = (site: ISite) => {
  storedTemplate.value = serializeSite(site)
}

export const setShowSelectTemplateModal = (show: boolean) => {
  showSelectTemplateModal.value = show
}
