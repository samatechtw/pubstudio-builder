import { ISiteAssetViewModel } from '@pubstudio/shared/type-api-platform-site-asset'
import { ref } from 'vue'

// Controls asset create modal used in the Asset left menu
export const showCreateAssetModal = ref(false)

// Asset to update
export const updateAsset = ref<ISiteAssetViewModel | undefined>()
