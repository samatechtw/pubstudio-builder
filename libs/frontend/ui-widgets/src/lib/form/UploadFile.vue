<template>
  <div :class="{ 'file-upload-wrap': true, dragging }" :style="{ width, height }">
    <form
      :id="id"
      class="file-upload-form"
      action=""
      enctype="multipart/form-data"
      @drop="dropUploadImage"
      @dragenter="dragStart"
      @dragleave="dragEnd"
      @dragend="dragEnd"
      @input="handleFileSelect"
    >
      <label class="file-upload-area" :for="`image-upload-input${id}`">
        <slot>
          <div
            v-if="!loading"
            class="file-upload-button"
            :class="{ 'has-file': !!preview }"
          >
            <div class="file-upload-left">
              <PSAsset
                v-if="preview"
                :asset="preview"
                :canPlayVideo="false"
                class="file-upload-background"
              />
              <slot v-else name="preview" />
              <img src="@frontend-assets/icon/upload.svg" class="file-upload-image" />
            </div>
            <div class="file-upload-right">
              <div class="file-upload-title">
                {{ title ?? t('upload_file.title') }}
              </div>
              <div
                class="file-upload-subtitle"
                v-html="subtitle ?? t('upload_file.subtitle')"
              />
            </div>
          </div>
        </slot>
        <div v-if="loading" class="file-upload-spinner">
          <Spinner :size="24" color="#3a86ff" />
        </div>
      </label>
      <input
        :id="`file-upload-input${id}`"
        class="file-upload"
        type="file"
        :accept="accept"
        :disabled="isDisabled"
        @click="clickInputFile"
      />
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PSAsset from '../PSAsset.vue'
import Spinner from '../Spinner.vue'

const { t } = useI18n()

withDefaults(
  defineProps<{
    id?: string
    title?: string
    subtitle?: string
    isDisabled?: boolean
    preview?: string | null
    loading?: boolean
    accept?: string
    width?: string
    height?: string
  }>(),
  {
    id: '',
    title: undefined,
    subtitle: undefined,
    isDisabled: false,
    preview: null,
    loading: false,
    accept: 'image/*',
    width: '100%',
    height: '182px',
  },
)
const emit = defineEmits<{
  (e: 'file-select', value: File): void
}>()

const dragging = ref(false)
const selectedFile = ref<File>()

const handleFileSelect = (e: InputEvent | Event) => {
  if (e && e.target && e.type === 'input') {
    const files = (e.target as HTMLInputElement).files
    if (files) {
      selectedFile.value = files[0]
      emit('file-select', selectedFile.value)
    }
  } else if (e && e.type === 'drop') {
    const files = (e as InputEvent).dataTransfer?.files
    if (files) {
      selectedFile.value = files[0]
      emit('file-select', selectedFile.value)
    }
  }
  dragging.value = false
}
const dragStart = (e: Event) => {
  e.preventDefault()
  dragging.value = true
}
const dragEnd = (e: Event) => {
  e.preventDefault()
  dragging.value = false
}
const dropUploadImage = (e: Event) => {
  e.preventDefault()
  handleFileSelect(e)
}
const clickInputFile = (e: MouseEvent) => {
  if (e && e.target) {
    ;(e.target as HTMLInputElement).value = ''
  }
}
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

$outline: $border-widget;

.file-upload-wrap {
  @mixin flex-center;
  border: 1px solid $outline;
  .nft-asset {
    border: none;
  }
  .file-upload-form {
    position: relative;
    height: 100%;
    width: 100%;
  }
  .file-upload-background {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: transparent;
    background-size: contain;
    background-position: center;
    padding: 0;
    .nft-asset-image {
      border-radius: 0;
      background-size: contain;
      background-repeat: no-repeat;
    }
  }
  .file-upload {
    position: absolute;
    @mixin overlay;
    cursor: pointer;
    opacity: 0;
  }
  .file-upload-button {
    @mixin flex-row;
    @mixin body-large;
    color: black;
    text-align: left;
    pointer-events: none;
  }
  .file-upload-left {
    @mixin flex-center;
    width: 35%;
    border-right: 1px solid $outline;
    position: relative;
    .file-upload-image {
      position: absolute;
    }
  }
  .file-upload-right {
    @mixin flex-center-col;
    align-items: flex-start;
    padding: 0 40px;
    width: 65%;
  }
  .file-upload-subtitle {
    @mixin caption-small;
    display: inline;
    margin-top: 8px;
    span {
      margin: 0 3px;
      color: $blue-500;
    }
  }
  &.has-file {
    border: $blue-500;
  }
  &.dragging {
    border-color: $blue-500;
    .file-upload-left {
      border-color: $blue-500;
    }
  }
  .file-upload-spinner {
    @mixin flex-center-col;
    text-align: center;
  }
  .file-upload-button,
  .file-upload-spinner {
    z-index: 10;
    position: absolute;
    width: 100%;
    height: 100%;
    .loader {
      margin: 0;
    }
    img {
      width: 32px;
      margin-bottom: 6px;
    }
  }
}
</style>
