<template>
  <div class="meta-favicon">
    <div class="favicon-info-wrap">
      <div class="meta-name">
        {{ t('theme.favicon') }}
      </div>
      <div v-if="editingFavicon" class="favicon-info favicon-edit">
        <PSInput
          v-model="newFavicon"
          :placeholder="t('theme.favicon_url')"
          class="favicon-url-input"
          @keydown.enter="updateFavicon(newFavicon)"
          @keyup.esc="$event.srcElement.blur()"
        />
        <Check class="item-save" @click="updateFavicon(newFavicon)" />
      </div>
      <div v-else class="favicon-info favicon-view">
        <div class="favicon-url">
          {{ favicon || t('none') }}
        </div>
        <Edit class="edit-icon" @click="setEditingFavicon" />
      </div>
    </div>
    <div class="favicon-preview">
      <div class="favicon-text">
        {{ t('theme.favicon_text') }}
      </div>
      <Minus v-if="favicon" class="item-delete" @click="confirmRemoveFavicon = true" />
      <div class="favicon-image" @click="setUploadingFavicon">
        <img v-if="favicon" :src="favicon" />
        <div class="image-overlay" :class="{ force: !favicon }">
          <PSSpinner v-if="loadingSites" />
          <Plus v-else class="upload" />
        </div>
      </div>
    </div>
    <CreateAssetModal
      :show="uploadingFavicon"
      :sites="sites"
      :initialSiteId="apiSiteId"
      initialName="Favicon"
      @complete="uploadComplete"
      @cancel="uploadingFavicon = false"
    />
    <ConfirmModal
      :show="confirmRemoveFavicon"
      :title="t('theme.remove_favicon')"
      :text="t('theme.remove_favicon_text')"
      @confirm="updateFavicon(undefined)"
      @cancel="confirmRemoveFavicon = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { CreateAssetModal } from '@pubstudio/frontend/feature-site-assets'
import { useSites } from '@pubstudio/frontend/feature-sites'
import {
  Check,
  ConfirmModal,
  Edit,
  Minus,
  PSInput,
  PSSpinner,
  Plus,
} from '@pubstudio/frontend/ui-widgets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { IUploadFileResult } from '@pubstudio/frontend/feature-site-assets'
import { urlFromAsset } from '@pubstudio/frontend/util-asset'

const { t } = useI18n()
const { listSites, sites, loading: loadingSites } = useSites()
const { apiSiteId } = useSiteSource()

const props = defineProps<{
  favicon: string | undefined
}>()
const { favicon } = toRefs(props)

const emit = defineEmits<{
  (e: 'setFavicon', favicon: string | undefined): void
}>()

const confirmRemoveFavicon = ref(false)
const editingFavicon = ref(false)
const newFavicon = ref('')
const uploadingFavicon = ref(false)

const updateFavicon = (newFavicon: string | undefined) => {
  confirmRemoveFavicon.value = false
  editingFavicon.value = false
  if (newFavicon !== favicon.value) {
    emit('setFavicon', newFavicon)
  }
}

const uploadComplete = (asset: IUploadFileResult) => {
  uploadingFavicon.value = false
  updateFavicon(urlFromAsset(asset))
}

const setUploadingFavicon = async () => {
  await listSites({})
  uploadingFavicon.value = true
}

const setEditingFavicon = () => {
  editingFavicon.value = true
  newFavicon.value = favicon.value ?? ''
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';
.meta-favicon {
  display: flex;
  flex-direction: column;
}
.favicon-info-wrap {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
}
.favicon-info {
  display: flex;
  align-items: center;
  margin-top: 4px;
  width: 100%;
}
.favicon-edit {
  flex-grow: 1;
}
.favicon-view {
  margin-left: auto;
}
.favicon-url {
  @mixin truncate;
  @mixin text 14px;
}
.edit-icon {
  flex-shrink: 0;
}
.favicon-url-input {
  flex-grow: 1;
}
.item-save {
  @mixin size 22px;
}
.meta-name {
  @mixin title 14px;
  margin-right: 12px;
}
.item-delete {
  margin-left: auto;
  @mixin size 22px;
}
.favicon-text {
  @mixin text 14px;
  padding-right: 8px;
  flex-grow: 0;
}
.favicon-preview {
  @mixin flex-row;
  align-items: center;
  margin-top: 8px;
  .image-overlay {
    @mixin overlay;
    @mixin flex-center;
    opacity: 0;
    transition: opacity ease 0.2s;
    background-color: $white-opaque-60;
    &.force {
      opacity: 1;
    }
  }
  .favicon-image {
    @mixin size 56px;
    cursor: pointer;
    background-color: $grey-300;
    margin-left: 16px;
    position: relative;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
    }
    .upload {
      @mixin size 22px;
    }
    &:hover {
      .image-overlay {
        opacity: 1;
      }
    }
  }
}
</style>
