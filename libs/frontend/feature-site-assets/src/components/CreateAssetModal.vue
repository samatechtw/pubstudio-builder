<template>
  <Modal :show="show" cls="create-asset-modal" @cancel="cancel">
    <div class="modal-title">
      {{ assetToUpdate ? t('assets.replace') : t('assets.new') }}
    </div>
    <div class="modal-text">
      {{ text ?? t('assets.new_text') }}
    </div>
    <div class="asset-name-wrap">
      <STMultiselect
        :value="siteId"
        valueKey="id"
        labelKey="name"
        :placeholder="t('site')"
        :options="resolvedSites"
        :disabled="!!assetToUpdate"
        :clearable="false"
        class="site-select"
        @select="select"
      />
      <STInput
        v-model="name"
        name="asset-name"
        class="asset-name"
        :placeholder="t('assets.name')"
      />
      <PSButton
        class="create-button"
        size="medium"
        :text="assetToUpdate ? t('replace') : t('create')"
        :animate="loading"
        @click="uploadAsset"
      />
    </div>
    <ErrorMessage :error="error" :interpolationKey="errorInterpolationKey">
      <router-link :to="{ name: 'Assets' }" target="_blank">
        {{ t('assets.title') }}
      </router-link>
    </ErrorMessage>
    <div class="upload-wrap">
      <UploadFile
        class="create-asset-file-picker"
        :preview="assetBase64"
        accept="image/*"
        @fileSelect="updateAsset"
      >
        <template v-if="assetPlaceholder" #preview>
          <img :src="assetPlaceholder" class="asset-preview" />
        </template>
      </UploadFile>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'
import { STMultiselect } from '@samatech/vue-components'
import { ErrorMessage, Modal, PSButton, UploadFile } from '@pubstudio/frontend/ui-widgets'
import {
  ALL_CONTENT_TYPES,
  AssetContentType,
  ICreatePlatformSiteAssetRequest,
  IReplacePlatformSiteAssetRequest,
  ISiteAssetViewModel,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { parseApiError, toApiError } from '@pubstudio/frontend/util-api'
import {
  ValidatedFile,
  validateMedia,
  IValidateMediaError,
} from '@pubstudio/frontend/util-validate'
import { ISiteViewModel } from '@pubstudio/shared/type-api-platform-site'
import { useSites } from '@pubstudio/frontend/feature-sites'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { DEFAULT_TEMPLATE_ID } from '@pubstudio/shared/type-api-platform-template'
import { IUploadFileResult } from '../lib/upload-asset'
import { ASSET_PLACEHOLDERS, useSiteAssets } from '../lib/use-site-assets'
import { isAssetDroppable } from '@pubstudio/frontend/util-asset'

interface ISelectableSite {
  id: string
  name: string
  [key: string]: unknown
}

const i18n = useI18n()
const { t } = i18n
const { createAsset, replaceAsset, verifyAsset } = useSiteAssets()
const { listSites, sites: loadedSites } = useSites()

const props = withDefaults(
  defineProps<{
    show: boolean
    loadSites?: boolean
    initialSiteId?: string
    assetToUpdate?: ISiteAssetViewModel
    initialName?: string
    initialFile?: File
    sites?: ISiteViewModel[] | undefined
    text?: string
  }>(),
  {
    sites: undefined,
    initialSiteId: undefined,
    initialName: undefined,
    initialFile: undefined,
    loadSites: false,
    assetToUpdate: undefined,
    text: undefined,
  },
)
const {
  loadSites,
  initialName,
  initialSiteId,
  initialFile,
  sites: propSites,
  assetToUpdate,
} = toRefs(props)

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'complete', asset: IUploadFileResult): void
}>()

const name = ref('')
const siteId = ref()
const error = ref()

const assetPlaceholder = computed(() => {
  const type = validatedFile.value?.type
  return type ? ASSET_PLACEHOLDERS[type] : undefined
})

const errorInterpolationKey = computed(() => {
  const key = 'errors.AssetUsageExceeded'
  if (error.value === t(key)) {
    return key
  } else {
    return undefined
  }
})
const assetBase64 = ref('')
const loading = ref(false)
const validatedFile = ref<ValidatedFile | undefined>()

const resolvedSites = computed<ISelectableSite[]>(() => {
  const resolved = (propSites.value || loadedSites.value) ?? []
  const identity = store.user.identity?.value
  let extras: ISelectableSite[] = []
  if (store.user.isAdmin.value) {
    const adminTemplate = {
      id: DEFAULT_TEMPLATE_ID,
      name: t('assets.template'),
    }
    if (!identity || identity.id === DEFAULT_TEMPLATE_ID) {
      extras.push(adminTemplate)
    } else {
      extras = [adminTemplate, identity]
    }
  }
  return [...extras, ...resolved] as ISelectableSite[]
})

const handleAssetSelect = (validFile: ValidatedFile) => {
  const file = validFile.file
  if (
    [
      AssetContentType.Pdf,
      AssetContentType.Wasm,
      AssetContentType.Js,
      AssetContentType.Otf,
      AssetContentType.Ttf,
      AssetContentType.Woff2,
    ].includes(validFile.type)
  ) {
    // Handle these file types as preview in UploadFile slot
  } else {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      assetBase64.value = reader.result?.toString() ?? ''
    }
  }
  validatedFile.value = validFile
  if (!name.value) {
    name.value = file.name
  }
}

const updateAsset = async (file: File | null | undefined) => {
  if (file) {
    error.value = undefined
    try {
      const validFile = await validateMedia(
        { size: 10000000, types: ALL_CONTENT_TYPES },
        file,
      )
      handleAssetSelect(validFile)
    } catch (e) {
      const key = (e as IValidateMediaError).fileErrors[0]
      error.value = t(`errors.${key}`)
    }
  }
}

const uploadReplaceAsset = async (id: string, validatedFile: ValidatedFile) => {
  const payload: IReplacePlatformSiteAssetRequest = {
    name: name.value,
    content_size: validatedFile.file.size,
    content_type: validatedFile.type,
  }
  const result = await replaceAsset(id, payload, validatedFile.file)
  const success = await verifyAsset(result.id)
  if (success) {
    complete(result)
  } else {
    error.value = t('errors.asset_upload_failed')
  }
}

const uploadCreateAsset = async (validatedFile: ValidatedFile) => {
  const isIdentitySite = siteId.value === store.user.identity.value.id
  const payload: ICreatePlatformSiteAssetRequest = {
    name: name.value,
    content_size: validatedFile.file.size,
    content_type: validatedFile.type,
    site_id: isIdentitySite ? undefined : siteId.value,
    local_site_id: isIdentitySite ? siteId.value : undefined,
  }
  const result = await createAsset(payload, validatedFile.file)
  const success = await verifyAsset(result.id)
  if (success) {
    complete(result)
  } else {
    error.value = t('errors.asset_upload_failed')
  }
}

const uploadAsset = async () => {
  if (!validatedFile.value) {
    if (!error.value) {
      error.value = t('errors.invalid_file')
    }
    return
  }
  if (!assetToUpdate.value && !siteId.value) {
    error.value = t('errors.site_missing')
    return
  }
  loading.value = true
  try {
    if (assetToUpdate.value) {
      await uploadReplaceAsset(assetToUpdate.value.id, validatedFile.value)
    } else {
      await uploadCreateAsset(validatedFile.value)
    }
  } catch (e) {
    error.value = parseApiError(i18n, toApiError(e))
  } finally {
    loading.value = false
  }
}

const select = (value: ISelectableSite | undefined) => {
  siteId.value = value?.id
}

watch(initialSiteId, () => {
  siteId.value = initialSiteId.value
})

watch(initialName, () => {
  name.value = initialName.value ?? ''
})

watch(initialFile, () => {
  if (initialFile.value && isAssetDroppable(initialFile.value.type)) {
    name.value = initialFile.value.name ?? ''
    updateAsset(initialFile.value)
  }
})

const initializeAssetUpdate = () => {
  if (assetToUpdate.value) {
    siteId.value = assetToUpdate.value.site_id
    name.value = assetToUpdate.value.name
  } else {
    siteId.value =
      initialSiteId.value === 'identity'
        ? store.user.identity.value.id
        : initialSiteId.value
    name.value = initialName.value ?? ''
  }
}

const cleanup = () => {
  name.value = ''
  error.value = undefined
  validatedFile.value = undefined
  assetBase64.value = ''
}

const cancel = () => {
  cleanup()
  emit('cancel')
}

const complete = (result: IUploadFileResult) => {
  cleanup()
  emit('complete', result)
}

watch(assetToUpdate, () => {
  initializeAssetUpdate()
})

onMounted(() => {
  // TODO -- get sites from app store, or refresh the store here
  if (loadSites.value && store.auth.loggedIn.value) {
    listSites({})
  }
  initializeAssetUpdate()
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.create-asset-modal {
  .modal-inner {
    width: 480px;
    max-width: 95%;
    max-height: 95%;
    overflow-y: scroll;
  }

  .modal-text {
    margin: 16px 0 16px;
    font-weight: 400;
  }

  .asset-name-wrap {
    display: flex;
    align-items: center;
  }
  .site-select {
    width: 120px;
  }
  .asset-name {
    flex-grow: 1;
    margin-left: 12px;
  }
  .create-button {
    margin-left: 8px;
    min-width: 80px;
    width: 80px;
    white-space: nowrap;
  }
  .upload-wrap {
    margin-top: 16px;
  }
  .asset-preview {
    width: 40%;
    background-color: white;
  }
}
</style>
