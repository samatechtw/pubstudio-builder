<template>
  <div class="img-wrap">
    <Transition name="image-show">
      <img
        v-show="imageLoaded"
        :src="image"
        :class="imageClass"
        @load="imageLoaded = true"
      />
    </Transition>
    <Transition name="image-show">
      <img v-show="!imageLoaded" :src="placeholder" :class="placeholderClass" />
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

defineProps<{
  image: string
  placeholder: string
  imageClass?: string | undefined
  placeholderClass?: string | undefined
}>()

const imageLoaded = ref(false)
</script>

<style lang="postcss" scoped>
.image-show-enter-active,
.image-show-leave-active {
  transition: all 0.3s linear;
}

.image-show-enter-from,
.image-show-leave-to {
  opacity: 0;
}
</style>
