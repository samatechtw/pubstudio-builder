<template>
  <div class="simple-upload-wrap">
    <form
      :id="id"
      class="simple-upload-form"
      action=""
      enctype="multipart/form-data"
      @input="handleFileSelect"
    >
      <label class="simple-upload-area" :for="inputId">
        <slot> </slot>
      </label>
      <input
        :id="inputId"
        class="simple-upload"
        type="file"
        :accept="accept"
        :disabled="isDisabled"
        @click="clickInputFile"
      />
    </form>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

const {
  id = '',
  isDisabled = false,
  accept = 'application/json',
} = defineProps<{
  id?: string
  isDisabled?: boolean
  accept?: string
}>()
const emit = defineEmits<{
  (e: 'selectFile', value: File): void
}>()

const selectedFile = ref<File>()

const inputId = computed(() => `simple-upload-input${id}`)

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

.simple-upload-wrap {
  @mixin flex-center;
  .simple-upload-form {
    position: relative;
    height: 100%;
    width: 100%;
  }
  .simple-upload {
    @mixin overlay;
    cursor: pointer;
    opacity: 0;
    font-size: 0;
  }
}
</style>
