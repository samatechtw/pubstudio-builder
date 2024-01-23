<template>
  <Suspense
    ><ExamplePreview v-if="showPreview" @close="showPreview = false" />
    <ExampleBuilder v-else @showPreview="showPreview = true" />
  </Suspense>

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
@import '@theme/css/components/app.postcss';
@import '@theme/css/mixins.postcss';

#app {
  height: 100%;
}

.app {
  @mixin flex-col;
  height: 100%;
  overflow-y: auto;
  & > .app-content {
    @mixin flex-col;
    padding-top: $header-height;
    flex-shrink: 0;
    flex-grow: 1;
    background-color: white;
    & > .app-router-view {
      flex-grow: 1;
    }
  }
}

.component-content-container {
  .pm-p {
    &::after {
      content: '\200b';
    }
    &.pm-p-placeholder {
      cursor: text;
    }
  }
}

@media (max-width: 640px) {
  .app {
    & > .app-content {
      padding-top: $header-height-mobile;
    }
  }
}
</style>
