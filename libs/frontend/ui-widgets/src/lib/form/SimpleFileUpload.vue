<template>
  <div class="file-upload-wrap">
    <form
      :id="id"
      class="file-upload-form"
      action=""
      enctype="multipart/form-data"
      @input="handleFileSelect"
    >
      <label class="file-upload-area" :for="`image-upload-input${id}`">
        <slot> </slot>
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

withDefaults(
  defineProps<{
    id?: string
    isDisabled?: boolean
    accept?: string
  }>(),
  {
    id: '',
    isDisabled: false,
    accept: 'application/json',
  },
)
const emit = defineEmits<{
  (e: 'selectFile', value: File): void
}>()

const selectedFile = ref<File>()

const handleFileSelect = (e: InputEvent | Event) => {
  if (e && e.target && e.type === 'input') {
    const files = (e.target as HTMLInputElement).files
    if (files) {
      selectedFile.value = files[0]
      emit('selectFile', selectedFile.value)
    }
  } else if (e && e.type === 'drop') {
    const files = (e as InputEvent).dataTransfer?.files
    if (files) {
      selectedFile.value = files[0]
      emit('selectFile', selectedFile.value)
    }
  }
}
const clickInputFile = (e: MouseEvent) => {
  if (e && e.target) {
    ;(e.target as HTMLInputElement).value = ''
  }
}
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.file-upload-wrap {
  @mixin flex-center;
  .file-upload-form {
    position: relative;
    height: 100%;
    width: 100%;
  }
  .file-upload {
    position: absolute;
    @mixin overlay;
    cursor: pointer;
    opacity: 0;
    font-size: 0;
  }
}
</style>
