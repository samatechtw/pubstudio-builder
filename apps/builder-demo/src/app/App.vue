<template>
  <ExamplePreview v-if="showPreview" @close="showPreview = false" />
  <ExampleBuilder v-else @showPreview="showPreview = true" />
  <AppHUD />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { AppHUD } from '@pubstudio/frontend/ui-widgets'
import ExamplePreview from './components/ExamplePreview.vue'
import ExampleBuilder from './components/ExampleBuilder.vue'

const showPreview = ref()

onMounted(async () => {
  // App mounted
})
</script>

<style lang="postcss">
#app {
  height: 100%;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  & > .app-content {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    flex-grow: 1;
  }
}
</style>
